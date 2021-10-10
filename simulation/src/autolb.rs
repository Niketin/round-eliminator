use crate::BigNum;
use crate::auto::Auto;
use crate::auto::Sequence;
use crate::auto::Step;
use crate::problem::DiagramType;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::collections::HashSet;

type Problem = crate::problem::GenericProblem;

#[derive(Clone)]
pub struct AutoLb {
    done: HashSet<(usize, Problem)>,
    merge_unreachable : bool,
    merge_diagram : bool,
    merge_indirect : bool,
    addarrow : bool,
    merge_new_to_old : bool,
    merge_new_to_new : bool,
    merge_old_to_new : bool,
    merge_new_to_new_nonneighbor : bool
}

#[derive(Copy,Clone,Debug)]
pub enum Simplification{
    Merge((usize,usize)),
    Addarrow((usize,usize))
}

impl Auto for AutoLb {
    type Simplification = Simplification;

    fn new(features: &[&str]) -> Self {
        Self {
            done: HashSet::new(),
            merge_unreachable: features.iter().any(|&x| x == "unreach"),
            merge_diagram: features.iter().any(|&x| x == "diag"),
            addarrow: features.iter().any(|&x| x == "addarrow"),
            merge_indirect : features.iter().any(|&x| x == "indirect"),
            merge_new_to_old : features.iter().any(|&x| x == "use_new_to_old"),
            merge_new_to_new : features.iter().any(|&x| x == "use_new_to_new"),
            merge_old_to_new : features.iter().any(|&x| x == "use_old_to_new"),
            merge_new_to_new_nonneighbor : features.iter().any(|&x| x == "use_new_to_new_nonneighbor"),
        }
    }

    /// The possible simplifications are given by following the arrows of the diagram, or by considering unreachable labels
    fn simplifications(
        &mut self,
        sol: &mut Sequence<Self>,
        _: usize,
    ) -> Box<dyn Iterator<Item = Self::Simplification>> {
        let mut v = vec![];
        if self.merge_unreachable {
            v.extend(sol.current().unreachable_pairs().into_iter().map(|x|Simplification::Merge(x)));
        }
        if self.merge_diagram && ! self.merge_indirect {
            v.extend(sol.current().diagram.clone().into_iter().map(|x|Simplification::Merge(x)));
        }
        if self.merge_indirect {
            v.extend(sol.current().reachable.clone().into_iter().map(|x|Simplification::Merge(x)));
        }
        if self.addarrow {
            v.extend(sol.current().unreachable_pairs().into_iter().map(|x|Simplification::Addarrow(x)));
        }
        let mut new_labels = HashSet::new();
        let mut old_labels = HashSet::new();
        let map_label_oldset = sol.current().map_label_oldset.clone().unwrap_or(vec![]);
        let oldsets : Vec<_> = map_label_oldset.iter().map(|(_,o)|o.clone()).collect();
        //let oldlabels = oldsets.iter().fold(BigBigNum::zero(),|a,b| a|b.clone());
        for (l,o) in map_label_oldset.iter() {
            let mut is_old = false;
            for contained in o.one_bits() {
                let mut containers : Vec<_> = oldsets.iter().filter(|old|old.bit(contained)).cloned().collect();
                containers.sort_by_key(|set|set.count_ones());
                let minsize = containers[0].count_ones();
                let mincontainers : Vec<_> = containers.into_iter().filter(|c|c.count_ones()==minsize).collect();
                if mincontainers.contains(o) {
                    is_old = true;
                }
            }
            if is_old {
                old_labels.insert(*l);
            } else {
                new_labels.insert(*l);
            }
        }
        /*for l in &old_labels {
            println!("{} is an old label",sol.current().map_label_text()[l]);
        }
        for l in &new_labels {
            println!("{} is a new label",sol.current().map_label_text()[l]);
        }*/
        if self.merge_old_to_new {
            v.extend(sol.current().diagram.clone().into_iter().filter(|(a,b)| old_labels.contains(a) && new_labels.contains(b)).map(|x|Simplification::Merge(x)));
        } 
        if self.merge_new_to_new {
            v.extend(sol.current().diagram.clone().into_iter().filter(|(a,b)| new_labels.contains(a) && new_labels.contains(b)).map(|x|Simplification::Merge(x)));
        } 
        if self.merge_new_to_old {
            v.extend(sol.current().diagram.clone().into_iter().filter(|(a,b)| new_labels.contains(a) && old_labels.contains(b)).map(|x|Simplification::Merge(x)));
        } 
        if self.merge_new_to_new_nonneighbor {
            //println!("nnn");
            let pairs = new_labels.iter().cloned().cartesian_product(new_labels.iter().cloned()).filter(|(a,b)|a!=b);
            //for (a,b) in pairs.clone() {
            //    println!("possible merge: {} {}",sol.current().map_label_text()[&a],sol.current().map_label_text()[&b]);
            //}
            v.extend(pairs.map(|x|Simplification::Merge(x)));
        } 
        Box::new(v.into_iter())
    }

    fn simplify(
        &mut self,
        sequence: &mut Sequence<Self>,
        x: Self::Simplification,
    ) -> Option<Problem> {
        let speedups = sequence.speedups;
        let p = sequence.current();
        let np = match x {
            Simplification::Merge((c1,c2)) => p.replace(c1, c2, DiagramType::Accurate),
            Simplification::Addarrow((c1,c2)) => p.relax_add_arrow(c1, c2, DiagramType::Accurate),
        };
        if np.is_zero_rounds() || !self.done.insert((speedups, np.clone())) {
            return None;
        }
        Some(np)
    }

    /// A solution is better if we did more speedup steps to get a trivial problem, or the same but the current one is not a trivial problem.
    fn should_yield(
        &mut self,
        sol: &mut Sequence<Self>,
        best: &mut Sequence<Self>,
        _: usize
    ) -> bool {
        let sol_is_trivial = sol.current().is_zero_rounds();
        let best_is_trivial = best.current().is_zero_rounds();

        let should_yield = sol.speedups > best.speedups
            || (sol.speedups == best.speedups && !sol_is_trivial && best_is_trivial);
        /*
        //now the correct diagram has been always computed, so this part should be removed
        if should_yield {
            for x in sol.steps.iter_mut() {
                if let Step::Simplify((_, p)) = x {
                    p.compute_diagram_edges_from_rightconstraints();
                }
            }
        }*/
        should_yield
    }

    /// We should continue trying if we did not reach the speedup steps limit, and
    /// the current solution is still not 0 rounds solvable.
    fn should_continue(
        &mut self,
        sol: &mut Sequence<Self>,
        _: &mut Sequence<Self>,
        maxiter: usize
    ) -> bool {
        let sol_is_trivial = sol.current().is_zero_rounds();

        sol.speedups < maxiter && !sol_is_trivial
    }
}

impl std::fmt::Display for Sequence<AutoLb> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut cloned = self.clone();
        writeln!(
            f,
            "\nLower bound of {} rounds.\n",
            self.speedups + if self.current().is_zero_rounds() { 0 } else { 1 }
        )?;

        let mut lastmap: Option<HashMap<_, _>> = None;

        for step in cloned.steps.iter_mut() {
            let p = match step {
                Step::Initial(p) => {
                    writeln!(f, "\nInitial problem\n{}\n", p.as_result())?;
                    p
                }
                Step::Simplify((simpl, p)) => {
                    let map = lastmap.unwrap();
                    match simpl {
                        Simplification::Merge((x,y)) => writeln!(f, "Relax {} -> {}\n", map[x], map[y])?,
                        Simplification::Addarrow((x,y)) => writeln!(f, "AddArrow {} -> {}\n", map[x], map[y])?
                    }
                    writeln!(f, "{}\n", p.as_result())?;
                    p
                }
                Step::Speedup(p) => {
                    writeln!(f, "\nSpeed up\n\n{}\n", p.as_result())?;
                    p
                }
                Step::MergeEqual(p) => {
                    writeln!(f, "\nMerged equal labels\n\n{}\n", p.as_result())?;
                    p
                }
            };
            lastmap = Some(p.map_label_text());
        }
        Ok(())
    }
}

#[derive(Deserialize, Serialize)]
pub enum ResultStep {
    Initial,
    Simplified(Vec<(String,String,String)>),
    Speedup,
    MergedEqual
}


pub struct ResultAutoLb {
    pub steps: Vec<(ResultStep, Problem)>,
}

impl Sequence<AutoLb> {
    pub fn as_result(&self) -> ResultAutoLb {
        let mut v = vec![];
        let mut simpls = vec![];
        let mut lastp: Option<Problem> = None;
        let mut lastmap: Option<HashMap<usize, String>> = None;

        for step in self.steps.iter() {
            let p = match step {
                Step::Initial(p) => {
                    v.push((ResultStep::Initial, p.clone()));
                    p
                }
                Step::Simplify((Simplification::Merge((x, y)), p)) => {
                    let map = lastmap.unwrap();
                    simpls.push(("merge".into(),map[x].clone(), map[y].clone()));
                    p
                }
                Step::Simplify((Simplification::Addarrow((x, y)), p)) => {
                    let map = lastmap.unwrap();
                    simpls.push(("addarrow".into(),map[x].clone(), map[y].clone()));
                    p
                }
                Step::Speedup(p) => {
                    if !simpls.is_empty() {
                        v.push((
                            ResultStep::Simplified(simpls.clone()),
                            lastp.take().unwrap(),
                        ));
                    }
                    simpls = vec![];
                    v.push((ResultStep::Speedup, p.clone()));
                    p
                }
                Step::MergeEqual(p) => {
                    if !simpls.is_empty() {
                        v.push((
                            ResultStep::Simplified(simpls.clone()),
                            lastp.take().unwrap(),
                        ));
                    }
                    simpls = vec![];
                    v.push((ResultStep::MergedEqual, p.clone()));
                    p
                }
            };
            lastmap = Some(p.map_label_text());
            lastp = Some(p.clone());
        }

        ResultAutoLb { steps: v }
    }
}
