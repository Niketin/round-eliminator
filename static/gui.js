import * as api from "./api.js"

let ctr = 0;

$(document).ready(function(){

    let div = $('<div/>');
    div.append($('<label>General Options</label>'));
    let mergeable = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Compute mergeable labels</p></label></div>');
    div.append(mergeable);
    let fulldiag = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Compute full diagram</p></label></div>');
    div.append(fulldiag);
    let zero = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Compute zero rounds solvability</p></label></div>');
    div.append(zero);
    div.append('<hr/>');
    div.append($('<label>Current active side</label>'));
    let zerocol = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Compute coloring solvability (only works if the passive side has degree 2)</p></label></div>');
    div.append(zerocol);
    let assumecol = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Assume a coloring is given</p></label></div>');
    div.append(assumecol);
    let givencolors = $('<input class="form-control"/>').attr({ type: 'number', value: '5' });
    let givencolorsform = $('<div class="form-group"/>').append(givencolors);
    div.append(givencolorsform);
    let orientation = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Assume a fixed orientation is given (only works if the passive side has degree 2). Number of outgoing edges:</p></label></div>');
    div.append(orientation);
    let outgoing = $('<input class="form-control"/>').attr({ type: 'number', value: '1' });
    let outgoingform = $('<div class="form-group"/>').append(outgoing);
    div.append(outgoingform);
    div.append('<hr/>');
    div.append($('<label>Current passive side</label>'));
    let zerocol2 = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Compute coloring solvability (only works if the active side has degree 2)</p></label></div>');
    div.append(zerocol2);
    let assumecol2 = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Assume a coloring is given</p></label></div>');
    div.append(assumecol2);
    let givencolors2 = $('<input class="form-control"/>').attr({ type: 'number', value: '5' });
    let givencolorsform2 = $('<div class="form-group"/>').append(givencolors2);
    div.append(givencolorsform2);
    let orientation2 = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Assume a fixed orientation is given (only works if the active side has degree 2). Number of outgoing edges:</p></label></div>');
    div.append(orientation2);
    let outgoing2 = $('<input class="form-control"/>').attr({ type: 'number', value: '1' });
    let outgoingform2 = $('<div class="form-group"/>').append(outgoing2);
    div.append(outgoingform2);

    let configcard = make_card("mb-2","p-0","<h6>Config</h6>",div,true,freeid());
    $('#config').append(configcard);

    let diag = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Generate diagrams</p></label></div>');
    $('#showdiag').append(diag);

    $( "#btn0" ).click(function(ev) {
        let f1 = $('#inf1').val();
        let f2 = $('#inf2').val();
        let text = "";
        for(let line of f1.split("\n")) {
            if( line != "" ){
                text += line + "\n";
            }
        }
        let a = text;
        text = "";
        for(let line of f2.split("\n")) {
            if( line != "" ){
                text += line + "\n";
            }
        }
        let b = text;
    
        let izero = $('input[type=checkbox]',zero).is(':checked');
        let izerocol = $('input[type=checkbox]',zerocol).is(':checked');
        let izerocol2 = $('input[type=checkbox]',zerocol2).is(':checked');
        let iassumecol = $('input[type=checkbox]',assumecol).is(':checked');
        let iassumecol2 = $('input[type=checkbox]',assumecol2).is(':checked');
        let imergeable = $('input[type=checkbox]',mergeable).is(':checked');
        let ifulldiag = $('input[type=checkbox]',fulldiag).is(':checked');
        let igivencol = parseInt(givencolors.val(),10);
        let igivencol2 = parseInt(givencolors2.val(),10);
        let iorientation = $('input[type=checkbox]',orientation).is(':checked');
        let ioutgoing = parseInt(outgoing.val(),10);
        let iorientation2 = $('input[type=checkbox]',orientation2).is(':checked');
        let ioutgoing2 = parseInt(outgoing2.val(),10);
        api.api_new_problem(a,b, [izero,izerocol,iassumecol,igivencol,izerocol2,iassumecol2,igivencol2,imergeable,ifulldiag,iorientation,ioutgoing,iorientation2,ioutgoing2], function(x){return append_new_problem_or_error(x, performed_initial());} );
    });

    $( "#btnclear" ).click(function(ev) {
        $( "#steps" ).html("");
    });

});

function escape(s){
    return $('<div/>').text(s).html();
}

function freeid(){
    return ++ctr;
}

function merge(v) {
    return v.join("");
}

function get_labels(problem){
    let x = problem[1];
    let labels = Array.from(new Set(x.left.concat(x.right).flat(Infinity)));
    labels.sort();
    return labels;
}

function get_renaming(problem){
    let x = problem[1];
    if( x.mapping != null ){
        let cur_to_old = {};
        for (let line of x.mapping) {
            let old = merge(line[0]);
            let cur = line[1];
            cur_to_old[cur] = old;
        }
        return cur_to_old;
    } else {
        return null;
    }
}

function make_performed_action(action){
    return $('<div class="card bg-info text-white m-2 p-2"/>').text(action);
}

function performed_initial() {
    return make_performed_action("Initial problem.");
}

function performed_mergeequal() {
    return make_performed_action("Merged equivalent labels.");
}

function performed_simplification(s){
    return make_performed_action("Performed simplification "+s);
}

function performed_addarrow(s){
    return make_performed_action("Added arrow "+s);
}

function performed_harden(s){
    return make_performed_action("Kept only labels "+s);
}

function performed_harden2(s){
    return make_performed_action("Removed label "+s);
}

function performed_speedup() {
    return make_performed_action("Performed speedup.");
}


function make_div_diagram(problem){
    let x = problem[1];
    let id = freeid();
    let nodes = get_labels(problem);//[...new Set([].concat.apply([], x.diagram))];
    let visnodes = [];
    for (let node of nodes ) {
        visnodes.push({id: node, label: node});
    }
    let visnodes2 = new vis.DataSet(visnodes);
    let visedges = [];
    for (let edge of x.diagram ) {
        visedges.push({ from : edge[0], to : edge[1], arrows: 'to'});
    }
    let visedges2 = new vis.DataSet(visedges);
    let visdata = {
        nodes: visnodes2,
        edges: visedges2
    };

    let diagram = $('<div class="panel-resizable" style="width: 300px; height: 300px;" id="'+id+'" onmouseover="document.body.style.overflow=\'hidden\';"  onmouseout="document.body.style.overflow=\'auto\';"></div>');
    diagram.ready(function(ev){
        let container = document.getElementById(id);
        let network = new vis.Network(document.getElementById(id), visdata, {});
    });

    return diagram;
}

function make_spinner(s){
    return $('<div class="card card-body m-2 bg-light"/>').append($('<div class="spinner-border" role="status"></div>')).append(s);

}

function make_button_speedup(problem) {
    let blob = problem[0];
    let next = $('<button type="button" class="btn btn-primary ml-2">Speedup</button>');
    next.click(function(ev) {
        let spinner = make_spinner("Performing speedup...");
        append_generic(spinner);
        api.api_speedup(blob, function(x){ spinner.remove(); return append_new_problem_or_error(x, performed_speedup() ); } );
    });
    return next;
}

function make_button_mergeequal(problem) {
    let blob = problem[0];
    let x = problem[1];
    if( (x.mergeable != null? x.mergeable : []).length == 0 )return $('');
    let next = $('<button type="button" class="btn btn-primary ml-2">Merge Equal Labels</button>');
    next.click(function(ev) {
        api.api_merge_equal(blob, function(x){ return append_new_problem(x, performed_mergeequal() ); } );
    });
    return next;
}

function make_button_edit(problem){
    let x = problem[1];
    let edit = $('<button type="button" class="btn btn-primary ml-2">Edit</button>');
    edit.click(function(ev) {
        let tleft = x.left.map(v => v.map(t => t.join("")).join(" ")).join("\n");
        let tright = x.right.map(v => v.map(t => t.join("")).join(" ")).join("\n");
        $('#inf1').val(tleft);
        $('#inf2').val(tright);
    });
    return edit;
}

/*
function make_div_simplifications(problem){
    let blob = problem[0];
    let simpls = $('<div/>');
    simpls.append('<p>Available simplifications:</p>');
    api.api_possible_simplifications(blob,function(v){
        for (let simpl of v ){
            let sblob = simpl[0];
            let sstr = simpl[1];
            let bstr = sstr[0] + "→" + sstr[1];
            var bsimpl = $('<button type="button" class="btn btn-primary m-2">'+escape(bstr)+'</button>');
            bsimpl.click(function(ev) {
                api.api_simplify(blob, sblob, function(x){return append_new_problem(x, performed_simplification(bstr));} );
            });
            simpls.append(bsimpl);
        }
    });
    return simpls;
}*/
function make_div_simplifications(problem){
    let blob = problem[0];
    let labels = get_labels(problem);
    let simpls = $('<div/>');
    let g1 = "g"+freeid();
    let g2 = "h"+freeid();
    simpls.append('<p>Choose the label to replace</p>');
    {
        let i = 0;
        let gridid = g1;
        for(let label of labels) {
            let newid = "i"+freeid();
            let input = $('<input class="form-check-input" type="radio" name="'+gridid+'" id="'+newid+'" '+ (i==0?"checked":"")+'></input>').val(label);
            let lab = $('<label class="form-check-label" for="'+newid+'"/>').text(label);
            let div = $('<div class="form-check form-check-inline"/>').append(input).append(lab);
            simpls.append(div);
            i++;
        }
        simpls.append('<p/>');
    }{
        simpls.append('<p>Choose the replacement</p>');
        let i = 0;
        let gridid = g2;
        for(let label of labels) {
            let newid = "j"+freeid();
            let input = $('<input class="form-check-input" type="radio" name="'+gridid+'" id="'+newid+'" '+ (i==1?"checked":"")+'></input>').val(label);
            let lab = $('<label class="form-check-label" for="'+newid+'"/>').text(label);
            let div = $('<div class="form-check form-check-inline"/>').append(input).append(lab);
            simpls.append(div);
            i++;
        }
        simpls.append('<p/>');
    }
    var bsimpl = $('<button type="button" class="btn btn-primary m-2">Simplify</button>');
    bsimpl.click(function(ev) {
        let choice1 = $("input[name='"+g1+"']:checked").val();
        let choice2 = $("input[name='"+g2+"']:checked").val();
        let bstr = choice1 + "→" + choice2;
        if( choice1 != choice2 ){
            api.api_simplify_s(blob, [choice1,choice2], function(x){return append_new_problem(x, performed_simplification(bstr));} );
        }else{
            alert("Please choose different labels");
        }
    });
    simpls.append(bsimpl);
    return simpls;
}

function make_div_addarrow(problem){
    let blob = problem[0];
    let simpls = $('<div/>');
    simpls.append('<p>Available simplifications:</p>');
    api.api_possible_addarrow(blob,function(v){
        for (let simpl of v ){
            let sblob = simpl[0];
            let sstr = simpl[1];
            let bstr = sstr[0] + "→" + sstr[1];
            var bsimpl = $('<button type="button" class="btn btn-primary m-2">'+escape(bstr)+'</button>');
            bsimpl.click(function(ev) {
                api.api_addarrow(blob, sblob, function(x){return append_new_problem(x, performed_addarrow(bstr));} );
            });
            simpls.append(bsimpl);
        }
    });
    return simpls;
}

function make_div_harden(problem){
    let blob = problem[0];
    let x = problem[1];
    let labels = get_labels(problem);

    let hard = $('<div/>');
    let choices = $('<div/>');
    hard.append('<p>Please choose which labels should be kept.</p>');
    for(let label of labels){
        let check = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">'+escape(label)+'</p></label></div>');
        choices.append(check);
    }
    let pred = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Add diagram predecessors</p></label></div>');
    hard.append(choices);
    hard.append('<hr/>');
    hard.append(pred);
    let hardbtn = $('<button type="button" class="btn btn-primary">Harden</button>');
    hardbtn.click(function(ev) {
        let checks = Array.from($('input[type=checkbox]',choices));
        let entries = Array.from(checks.entries());
        let selected = entries.filter(([i,x]) => x.checked).map(([i,x]) => i);
        let selectedlabels = selected.map(i => labels[i]);
        let usepred = $('input[type=checkbox]',pred).is(':checked');
        api.api_harden(blob,selectedlabels,usepred,function(x){return append_new_problem_or_error(x, performed_harden(merge(selectedlabels)));} );
    });
    hard.append(hardbtn);
    return hard;
}

function make_div_harden2(problem){
    let blob = problem[0];
    let x = problem[1];
    let labels = get_labels(problem);
    let simpls = $('<div/>');
    simpls.append('<p>Click on the label that you want to remove</p>');
    let pred = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Add diagram predecessors</p></label></div>');
    for (let simpl of labels ){
        var bsimpl = $('<button type="button" class="btn btn-primary m-2">'+escape(simpl)+'</button>');
        bsimpl.click(function(ev) {
            let others = labels.filter(x => x != simpl);
            let usepred = $('input[type=checkbox]',pred).is(':checked');
            api.api_harden(blob, others, usepred, function(x){return append_new_problem_or_error(x, performed_harden2(simpl));} );
        });
        simpls.append(bsimpl);
    }
    simpls.append('<hr/>');
    simpls.append(pred);
    return simpls;
}


function make_div_autolb(problem){
    let blob = problem[0];
    let x = problem[1];
    let divautolb = $('<div/>');
    let iterlabel = $('<label>Maximum number of iterations:</label>');
    let labelslabel = $('<label>Maximum number of labels:</label>');
    let rcslabel = $('<label>Maximum number of right closed subsets:</label>');

    let maxiterlb = $('<input class="form-control"/>').attr({ type: 'number', value: '15' });
    let maxlabelslb = $('<input class="form-control"/>').attr({ type: 'number', value: '5' });
    let maxrcslb = $('<input class="form-control"/>').attr({ type: 'number', value: '20' });

    let iterform = $('<div class="form-group"/>').append(iterlabel).append(maxiterlb);
    let labelsform = $('<div class="form-group"/>').append(labelslabel).append(maxlabelslb);
    let rcsform = $('<div class="form-group"/>').append(rcslabel).append(maxrcslb);

    divautolb.append(iterform);
    divautolb.append(labelsform);
    divautolb.append(rcsform);

    let unreach = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Try to merge unreachable labels</p></label></div>');
    divautolb.append(unreach);
    let diagram = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Try to merge diagram neighbors</p></label></div>');
    divautolb.append(diagram);
    let indirect = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Try to merge indirect neighbors</p></label></div>');
    divautolb.append(indirect);
    let arrows = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Try to add diagram edges</p></label></div>');
    divautolb.append(arrows);
    let merge_new_to_old = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Merge new to old</p></label></div>');
    divautolb.append(merge_new_to_old);
    let merge_new_to_new = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Merge new to new</p></label></div>');
    divautolb.append(merge_new_to_new);
    let merge_old_to_new = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Merge old to new</p></label></div>');
    divautolb.append(merge_old_to_new);
    let merge_new_to_new_nonneighbor = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Merge new to new nonneighbors</p></label></div>');
    divautolb.append(merge_new_to_new_nonneighbor);

    let autolb = $('<button type="button" class="btn btn-primary">Automatic Lower Bound</button>');
    autolb.click(function(ev) {
        let divdivresult = $('<div class="card m-2"/>');
        let closediv = $('<div class="text-left"/>');
        let close = $('<button type="button" class="btn btn-secondary m-2">Close LB</button>');
        closediv.append(close);
        divdivresult.append(closediv);

        let divresult = $('<div class="container-fluid m-0 p-0"/>');
        let spinner = make_spinner("Computing lower bound...");
        divdivresult.append(spinner);

        let onresult = function (_result) {
            if( _result.E != null ){
                alert(_result.E);
                return;
            }
            let result = _result.L;

            let toshow = $('<div/>')

            let rounds = result.filter(step => step[1] == "Speedup" ).length;
            let nt = result[result.length-1][2].is_trivial || result[result.length-1][2].is_trivial_orientation;
            if ( !nt )rounds += 1;
            toshow.append(make_performed_action("Lower bound of " + rounds + " rounds."));


            for( let step of result ) {
                let what = step[1];
                if( what == "Initial" )toshow.append(performed_initial());
                else if( what == "Speedup" )toshow.append(performed_speedup());
                else if( what == "MergedEqual" )toshow.append(performed_mergeequal());
                else if( what.Simplified != null ){
                    for(let simpl of what.Simplified ){
                        let action = simpl[0];
                        let ssimpl = simpl[1] + "→" + simpl[2];
                        if( action == "merge" )toshow.append(performed_simplification(ssimpl));
                        else if(action == "addarrow")toshow.append(performed_addarrow(ssimpl));
                        else alert("this should not happen");
                    }
                }
                problem = [step[0],step[2]];
                append_new_problem_to(problem,toshow,null);
            }
            divresult.html(toshow);
        }
        let onend = function () {
            spinner.remove();
        }
        divdivresult.append(divresult);
        append_generic(divdivresult);
        let useunreach = $('input[type=checkbox]',unreach).is(':checked');
        let usediag = $('input[type=checkbox]',diagram).is(':checked');
        let useaddarrow = $('input[type=checkbox]',arrows).is(':checked');
        let useindirect = $('input[type=checkbox]',indirect).is(':checked');
        let use_new_to_old = $('input[type=checkbox]',merge_new_to_old).is(':checked');
        let use_new_to_new = $('input[type=checkbox]',merge_new_to_new).is(':checked');
        let use_old_to_new = $('input[type=checkbox]',merge_old_to_new).is(':checked');
        let use_new_to_new_nonneighbor = $('input[type=checkbox]',merge_new_to_new_nonneighbor).is(':checked');



        let ch = api.api_autolb(blob, parseInt(maxiterlb.val(),10), parseInt(maxlabelslb.val(),10) ,parseInt(maxrcslb.val(),10), useunreach, usediag, useaddarrow, useindirect, use_new_to_old, use_new_to_new, use_old_to_new,use_new_to_new_nonneighbor, onresult, onend);
        close.click(function(){
            divdivresult.remove();
            ch();
        });
    });
    divautolb.append(autolb);
    return divautolb;
}

function make_div_autoub(problem){
    let blob = problem[0];
    let x = problem[1];
    let divautoub = $('<div/>');
    let iterlabel = $('<label>Maximum number of iterations:</label>');
    let labelslabel = $('<label>Maximum number of labels:</label>');
    let rcslabel = $('<label>Maximum number of right closed subsets:</label>');

    let maxiterub = $('<input class="form-control"/>').attr({ type: 'number', value: '5' });
    let maxlabelsub = $('<input class="form-control"/>').attr({ type: 'number', value: '4' });
    let maxrcsub = $('<input class="form-control"/>').attr({ type: 'number', value: '20' });

    let iterform = $('<div class="form-group"/>').append(iterlabel).append(maxiterub);
    let labelsform = $('<div class="form-group"/>').append(labelslabel).append(maxlabelsub);
    let rcsform = $('<div class="form-group"/>').append(rcslabel).append(maxrcsub);

    divautoub.append(iterform);
    divautoub.append(labelsform);
    divautoub.append(rcsform);

    let pred = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Slow and Accurate</p></label></div>');
    divautoub.append(pred);
    let det = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input"><p class="form-control-static custom-control-label">Test</p></label></div>');
    divautoub.append(det);
    let onlynew = $('<div class="custom-control custom-switch"><label><input type="checkbox" class="custom-control-input" checked><p class="form-control-static custom-control-label">Delete only new labels</p></label></div>');
    divautoub.append(onlynew);

    let autoub = $('<button type="button" class="btn btn-primary">Automatic Upper Bound</button>');
    autoub.click(function(ev) {
        let divdivresult = $('<div class="card m-2"/>');
        let closediv = $('<div class="text-left"/>');
        let close = $('<button type="button" class="btn btn-secondary m-2">Close UB</button>');
        closediv.append(close);
        divdivresult.append(closediv);
        
        let divresult = $('<div class="container-fluid m-0 p-0"/>');
        let spinner = make_spinner("Computing upper bound...");
        divdivresult.append(spinner);

        let onresult = function (_result) {
            if( _result.E != null ){
                alert(_result.E);
                return;
            }
            let result = _result.U;

            let toshow = $('<div/>');

            let rounds = result.filter(step => step[1] == "Speedup" ).length;
            let nt = result[result.length-1][2].is_trivial;
            //if ( !nt )rounds += 1;
            toshow.append(make_performed_action("Upper bound of " + rounds + " rounds."));

            for(let step of result ) {
                let what = step[1];
                if( what == "Initial" )toshow.append(performed_initial());
                else if( what == "MergedEqual" )toshow.append(performed_mergeequal());
                else if( what == "Speedup" )toshow.append(performed_speedup());
                else if( what.Simplified != null ){
                    let s = merge(what.Simplified);
                    toshow.append(performed_harden(s));
                }
                problem = [step[0],step[2]];
                append_new_problem_to(problem,toshow,null);
            }
            divresult.html(toshow);
        }
        let onend = function () {
            spinner.remove();
        }
        divdivresult.append(divresult);
        append_generic(divdivresult);
        let usepred = $('input[type=checkbox]',pred).is(':checked');
        let usedet = $('input[type=checkbox]',det).is(':checked');
        let useonlynew = $('input[type=checkbox]',onlynew).is(':checked');

        let ch = api.api_autoub(blob, parseInt(maxiterub.val(),10), parseInt(maxlabelsub.val(),10),parseInt(maxrcsub.val(),10) , usepred, usedet, useonlynew, onresult, onend);
        close.click(function(){
            divdivresult.remove();
            ch();
        });
    });
    divautoub.append(autoub);
    return divautoub;
}

function make_div_triviality(problem){
    let x = problem[1];
    let trivial = "" + get_labels(problem).length + " labels.";
    if ( x.is_trivial != null ) {
        trivial += " The problem is " + (x.is_trivial? "" : "NOT ") + "zero rounds solvable.";
    }
    if( ! x.is_trivial && x.is_trivial_orientation ){
        trivial += " The problem can be solved in zero rounds given the assumed orientation.";
    }
    if( ! x.is_trivial && x.coloring != null && x.coloring > 1 ){
        trivial += " The problem can be solved in zero rounds given a " + x.coloring + " coloring.";
    }
    if( trivial != "" ){
        let div = $('<div/>').append(trivial);
        let card = $('<div class="card card-body m-0 p-2"/>').append(div);
        return $('<div class="col-auto m-2 p-0">').append(card);
    } else {
        return $('<div/>');
    }
}

function make_div_mergeable(problem) {
    let x = problem[1];
    if( (x.mergeable != null ? x.mergeable : []).length > 0 ){
        let groups = x.mergeable.map( v => merge(v));
        let mergeable = groups.join(", ");
        let div = $('<div/>').append("The following labels could be merged without changing the complexity of the problem: " + escape(mergeable))
        let card = $('<div class="card card-body m-0 p-2"/>').append(div);
        return $('<div class="col-auto m-2 p-0">').append(card);
    }
    return $('<div/>');

}

function make_oldlabel(v,cur_to_old) {
    return merge(v.map(function(x){ return '<span class="rounded m-1 labelborder">'+escape(cur_to_old[x])+'</span><br/>'; }));
}

function make_div_renaming(problem){
    let renaming = get_renaming(problem);
    let table = $('<table class="table"/>');
    for (let [cur,old] of Object.entries(renaming)) {
        let tr = $('<tr/>');
        tr.append('<td><span class="rounded m-1 labelborder">'+escape(old)+'</span></td>');
        tr.append('<td>'+escape(cur)+'</td>');
        table.append(tr);
    }
    return table;
}

function make_div_newrenaming(problem){
    let div = $('<div/>');

    let renaming = get_renaming(problem);
    let table = $('<table class="table"/>');
    for (let [cur,old] of Object.entries(renaming)) {
        let tr = $('<tr/>');
        tr.append('<td><span class="rounded m-1 labelborder">'+escape(old)+'</span></td>');
        let input = $('<input/>').val(cur);
        tr.append($('<td/>').append(input));
        table.append(tr);
    }
    div.append(table);
    let rename = $('<button type="button" class="btn btn-primary m-2">Rename</button>');
    rename.click(function(ev) {
        let labels = Array.from($('input',table)).map(x => x.value);
        let entries = Array.from(labels.entries());
        let newmapping = entries.map(([i,x]) => [problem[1].mapping[i][0],x]);
        api.api_rename(problem[0],newmapping,function(x){return append_new_problem_or_error(x, make_performed_action("Renaming."));} );
    });
    div.append(rename);

    let rename2 = $('<button type="button" class="btn btn-primary m-2">Old Label Mapping</button>');
    rename2.click(function(ev) {
        let oldlabels = [... new Set(problem[1].mapping.map(x => x[0]).flat())];
        let newsets = problem[1].mapping.map(x => x[0]);
        let renaming = {};
        for( let label of oldlabels ){
            let containing = newsets.filter(set => set.includes(label));
            let minsize = Math.min(...containing.map(x => x.length));
            let unique_smallest = containing.filter(x => x.length == minsize).length == 1;
            if( unique_smallest ){
                let idx = newsets.findIndex( set => set.includes(label) && set.length == minsize);
                renaming[idx] = label;
            }
        }
        let torename = Array.from($('input',table));
        for( let [i,set] of newsets.entries() ){
            let newlabel = i in renaming ? renaming[i] : "("+ newsets[i].join("").replace(/[()]/g,"_") +")";
            $(torename[i]).val(newlabel);
        }
    });
    div.append(rename2);

    return div;
}

function make_table(v,f, shouldcolor = function(){ return false; }){
    let s = '<table class="table">';
    for (let line of v) {
        if( shouldcolor(line) ){
            s += '<tr class="text-info font-weight-bold">'
        } else {
            s += '<tr>';
        }
        for (let elem of line) {
            s += '<td>'+f(elem)+'</td>';
        }
        s += '</tr>';
    }
    s += '</table>';
    return s;
}

function make_card(classes1,classes2,title,content,defaultshow,id){
    let r = $('<div class="card '+classes1+'"><div class="card-header '+classes2+'"><button class="btn btn-link" data-toggle="collapse" data-target=".collapse'+id+'">'+
        title + '</button></div><div class="collapse' +id+ ' collapse ' + (defaultshow?"show":"") + '"><div class="card-body"></div></div></div>');
    r.find('.card-body').first().append(content);
    return r;
}


function generate_html_for_problem(problem, reason) {
    let blob = problem[0];
    let x = problem[1];
    
    let col_trivial = make_div_triviality(problem);

    let col_left_old = $("<div/>");
    let col_right_old = $("<div/>");
    let col_renaming = $("<div/>");

    let trivials = new Set((x.trivial_lines != null ? x.trivial_lines : []).map(v => JSON.stringify(v)));
    let orientations = new Set((x.orientation_lines != null ? x.orientation_lines : []).map(v => JSON.stringify(v)));
    let colors = new Set((x.coloring_lines != null ? x.coloring_lines : []).map(v => JSON.stringify(v)));
    let set_to_use = x.is_trivial ? trivials : x.is_trivial_orientation ? orientations : colors;
    let highlight = function(v){ let t = JSON.stringify(v); return set_to_use.has(t); };

    if( x.mapping != null ){
        let id = freeid();
        let cur_to_old = get_renaming(problem);
        let left_old = make_table(x.left,  function(v){return make_oldlabel(v,cur_to_old);}, highlight);
        let right_old = make_table(x.right, function(v){return make_oldlabel(v,cur_to_old);});
        let renaming = make_div_renaming(problem);
        col_left_old = make_card("m-2","p-0","<h6>Active (Before Renaming)</h6><h6><small>Any choice satisfies previous Passive</small></h6>",left_old,false,id);
        col_right_old = make_card("m-2","p-0","<h6>Passive (Before Renaming)</h6><h6><small>Exists choice satisfying previous Active</small></h6>",right_old,false,id);
        col_renaming = make_card("m-2","p-0","<h6>Renaming</h6><h6><small>Old and new labels</small></h6>",renaming,false,id);
    }
    
    let id_new_leftright = freeid();
    let left_new = make_table(x.left,function(x){return merge(x.map(y => escape(y)))}, highlight);
    let right_new = make_table(x.right,function(x){return merge(x.map(y => escape(y)))});
    let col_left_new = make_card("m-2","p-0","<h6>Active</h6><h6><small>Any choice satisfies previous Passive</small></h6>",left_new,true,id_new_leftright);
    let col_right_new = make_card("m-2","p-0","<h6>Passive</h6><h6><small>Exists choice satisfying previous Active</small></h6>",right_new,true,id_new_leftright);

    let show_diagram = $('input[type=checkbox]',$('#showdiag')).is(':checked');
    let col_diagram = $('<div/>');
    if ( show_diagram ){
        let diagram = make_div_diagram(problem);
        col_diagram =  make_card("m-2","p-0","<h6>Diagram</h6><h6><small>Strength of right side labels</small></h6>",diagram,true,id_new_leftright);
    }

    let col_mergeable = make_div_mergeable(problem);

    let next = make_button_speedup(problem);
    let mergeequal = make_button_mergeequal(problem);
    let edit = make_button_edit(problem);
    let simpls = make_div_simplifications(problem);
    let simpls_card = make_card("m-2","p-0","<h7>Simplifications</h7>",simpls,false,freeid());
    let addarrow = make_div_addarrow(problem);
    let addarrow_card = make_card("m-2","p-0","<h7>Add arrows</h7>",addarrow,false,freeid());
    let hard = make_div_harden(problem);
    let hard_card = make_card("m-2","p-0","<h7>Harden v1</h7>",hard,false,freeid());
    let hard2 = make_div_harden2(problem);
    let hard2_card = make_card("m-2","p-0","<h7>Harden v2</h7>",hard2,false,freeid());
    let divautolb = make_div_autolb(problem);
    let divautoub = make_div_autoub(problem);
    let autolb_card = $('<div/>');
    let autoub_card = $('<div/>');
    if( x.config.compute_triviality ){
        autolb_card = make_card("m-2","p-0","<h7>Automatic Lower Bound</h7>",divautolb,false,freeid());
        autoub_card = make_card("m-2","p-0","<h7>Automatic Upper Bound</h7>",divautoub,false,freeid());
    } 

    let tools = $('<div/>');
    tools.append(next);
    tools.append(mergeequal);
    tools.append(edit);
    tools.append(simpls_card);
    tools.append(addarrow_card);
    tools.append(hard_card);
    tools.append(hard2_card);
    tools.append(autolb_card);
    tools.append(autoub_card);
    if( x.mapping != null ){
        let divnewrenaming = make_div_newrenaming(problem);
        let newrenaming_card = make_card("m-2","p-0","<h7>New Renaming</h7>",divnewrenaming,false,freeid());
        tools.append(newrenaming_card);
    }

    let col_tools = make_card("m-2 d-print-none","p-0","<h6>Tools</h6><h6><small>Speedup, edit, simplifications, ...</small></h6>",tools,true,id_new_leftright);

    let row = $('<div class="row p-0 m-2"/>').append(col_trivial,$('<div class="w-100"/>'),col_mergeable, $('<div class="w-100"/>'),col_left_old,col_right_old,col_renaming,$('<div class="w-100"/>'),col_left_new,col_right_new,col_diagram,col_tools);
    let result = $('<div class="card card-body m-2 p-2 bg-light"/>');

    let div = $('<div/>');

    let closediv = $('<div class="text-left"/>');
    let close = $('<button type="button" class="btn btn-secondary ml-3 mt-3">Close</button>');
    close.click(function(){
        div.remove();
    });
    closediv.append(close);

    result.append(row);

    result.prepend(closediv);

    if( reason != null ){
        div.append(reason);
    }
    div.append(result);
    return div;
}


function append_generic(x) {
    $("#steps").append(x);
}

function append_new_problem_to(x,to, reason) {
    let html = generate_html_for_problem(x,reason);
    to.append(html);
}

function append_new_problem(x, reason) {
    append_new_problem_to(x,$("#steps"),reason)
}

function append_new_problem_or_error(x, reason) {
    if( x.E != null ){
        alert(x.E);
        return;
    }
    append_new_problem_to(x.P,$("#steps"),reason)
}


