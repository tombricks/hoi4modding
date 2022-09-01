latestFocusID = 0
editing_focus_id = -1

focuses = {}
focusKeys = {}
editing_focus = false;
$('#focus_prereq_all').hide();

function Focus(internalID) {
    this.internalID = internalID;
    this.id = `new_focus_${internalID}`;
    this.name = "New Focus";
    this.icon = "GFX_goal_unknown";
    this.x = 0;
    this.y = 0;
    this.prerequisites = [];
    this.reverse_prerequisites = [];
    this.reverse_or_prerequisites = [];
    this.block_available = "";
    this.block_bypass = "";
    this.block_reward = "";
    this.block_allow = "";
    this.block_cancel = "";
    this.block_historical = "";
    this.block_tooltip = "";
    this.block_select = "";
}
function create_horizontal_line(divname, classes, originx, originy, length) {
    $("#line-container").append(`
        <div
            id="${divname}"
            class="line ${classes}"
            style="position:absolute;
                left:   ${ ((originx + 1) * 96) - 1  }px;
                top:    ${ ((originy) * 130) + 84  }px;
                width:  ${ (length * 96) + 2 }px;
                height: 2px
            "
        ></div>
    `);
}
function create_vertical_line(divname, classes, originx, originy, length) {
    $("#line-container").append(`
        <div
            id="${divname}"
            class="line ${classes}"
            style="position:absolute;
                left:   ${ ((originx + 1) * 96) - 1  }px;
                top:    ${ ((originy) * 130) + 84  }px;
                width:  2px;
                height: ${ (length * 130) + 2 }px;
            "
        ></div>
    `);
}
function draw_prerequisite_line(focus1, focus2, classes) {
    x1 = focuses[focus1].x;
    y1 = focuses[focus1].y;
    x2 = focuses[focus2].x;
    y2 = focuses[focus2].y;
    console.log(`(${x1}, ${y1}), (${x2}, ${y2})`);
    if (x1 == x2) {
        console.log("1");
        create_vertical_line(
            `prerequisite-straight-${focus1}-${focus2}`,
            `line-focus-${focus1} line-focus-${focus2} prerequisite prerequisite-${focus1}-${focus2} ${classes}`,
            x1,
            y1,
            y2-y1
        );
    }
    else if (focuses[focus1].x > focuses[focus2].x) {
        console.log("2");
        create_vertical_line(
            `prerequisite-left-${focus1}-${focus2}-1`,
            `line-focus-${focus1} line-focus-${focus2} prerequisite prerequisite-${focus1}-${focus2} ${classes}`,
            x1,
            y1,
            0.25
        );
        create_horizontal_line(
            `prerequisite-left-${focus1}-${focus2}-2`,
            `line-focus-${focus1} line-focus-${focus2} prerequisite prerequisite-${focus1}-${focus2} ${classes}`,
            x2,
            y1+0.25,
            x1-x2
        );
        create_vertical_line(
            `prerequisite-left-${focus1}-${focus2}-2`,
            `line-focus-${focus1} line-focus-${focus2} prerequisite prerequisite-${focus1}-${focus2} ${classes}`,
            x2,
            y1+0.25,
            y2-y1-0.25
        );
    }
    else {
        console.log("3");
        create_vertical_line(
            `prerequisite-right-${focus1}-${focus2}-1`,
            `line-focus-${focus1} line-focus-${focus2} prerequisite prerequisite-${focus1}-${focus2} ${classes}`,
            x1,
            y1,
            0.25
        );
        create_horizontal_line(
            `prerequisite-right-${focus1}-${focus2}-2`,
            `line-focus-${focus1} line-focus-${focus2} prerequisite prerequisite-${focus1}-${focus2} ${classes}`,
            x1,
            y1+0.25,
            x2-x1
        );
        create_vertical_line(
            `prerequisite-right-${focus1}-${focus2}-2`,
            `line-focus-${focus1} line-focus-${focus2} prerequisite prerequisite-${focus1}-${focus2} ${classes}`,
            x2,
            y1+0.25,
            y2-y1-0.25
        );
    }
}
function draw_focus_prerequisites(focus) {
    $(`.line-focus-${focus}`).remove();
    for (prereq of focuses[focus].prerequisites) {
        if (prereq.length == 1) {
            draw_prerequisite_line(prereq[0], focus, "");
        }
        else {
            for (prereq2 of prereq) {
                draw_prerequisite_line(prereq2, focus, "prerequisite-or");
            }
        }
    }
    for (lead of focuses[focus].reverse_prerequisites) {
        draw_prerequisite_line(focus, lead, "");
    }
    for (lead of focuses[focus].reverse_or_prerequisites) {
        draw_prerequisite_line(focus, lead, "prerequisite-or");
    }
}
function submit_focus() {
        latestFocusID += 1;
        focus = new Focus(latestFocusID);
        focus.x = parseInt($("#focus_x").val());
        focus.y = parseInt($("#focus_y").val());
        focus.id = $("#focus_id").val();
        focus.name = $("#focus_name").val();
        focus.icon = $("#focus_icon").val();
        focus.block_available = focus_monaco_available.getValue();
        focus.block_bypass = focus_monaco_bypass.getValue();
        focus.block_reward = focus_monaco_reward.getValue();
        focus.block_allow = focus_monaco_allow.getValue();
        focus.block_cancel = focus_monaco_cancel.getValue();
        focus.block_historical = focus_monaco_historical.getValue();
        focus.block_tooltip = focus_monaco_tooltip.getValue();
        focus.block_select = focus_monaco_select.getValue();

        
        $("#focus-panel-focuses").append(`<div onclick="focus_click(${focus.internalID})" class="focus" id="focus-${focus.internalID}" style="left: ${focus.x*96+13}px; top: ${focus.y*130}px">
        <img class="center" style="position: absolute; top: 40px" src="assets/focus_unavailable_bg.png" />
        <p id="focus-${focus.internalID}-name" class="center" style="position: absolute; top: 76px; font-size: 14px">${focus.name}</p>
        <img id="focus-${focus.internalID}-icon" class="focus-icon center" style="position: absolute; top: -44px" src="assets/focuses/${focusesgfx[focus.icon]}" />
        </div>`);
        focuses[focus.internalID] = focus;
        focusKeys[focus.id] = focus.internalID;
        focusKeys[focus.internalID] = focus.id;
        focus_edit_select_focus(focus.internalID);
}
function focus_click(id) {
    if (editing_focus_id == id) {
        focus_edit_new_focus();
    }
    else {
        focus_edit_select_focus(id);
    }
}
monaco_init = false;
function focus_edit_new_focus() {
    editing_focus_id = -1;
    editing_focus = false;
    $('#focus_prereq_all').hide();
    $("#focus_id").val("TAG_new_focus");
    $("#focus_name").val("New Focus");
    $("#focus_icon").val("GFX_goal_unknown");
    if (monaco_init) {
        focus_monaco_available.setValue("");
        focus_monaco_bypass.setValue("");
        focus_monaco_reward.setValue("");
        focus_monaco_allow.setValue("");
        focus_monaco_cancel.setValue("");
        focus_monaco_historical.setValue("");
        focus_monaco_tooltip.setValue("");
        focus_monaco_select.setValue("");
    }
    // $("#focus_x").val(0);
    // $("#focus_y").val(0);
    $("#submit_focus").show();
    $(".focus").removeClass("half-opacity");
}
function focus_edit_select_focus(id) {
    editing_focus = true;
    $('#focus_prereq_all').show();
    editing_focus_id = id;
    $(".focus").addClass("half-opacity");
    $("#focus-"+id.toString()).removeClass("half-opacity");
    $("#focus_id").val(focuses[editing_focus_id].id);
    $("#focus_name").val(focuses[editing_focus_id].name);
    $("#focus_icon").val(focuses[editing_focus_id].icon);
    $("#focus_x").val(parseInt(focuses[editing_focus_id].x));
    $("#focus_y").val(parseInt(focuses[editing_focus_id].y));
    focus_monaco_available.setValue(focuses[editing_focus_id].block_available)
    focus_monaco_bypass.setValue(focuses[editing_focus_id].block_bypass)
    focus_monaco_reward.setValue(focuses[editing_focus_id].block_reward)
    focus_monaco_allow.setValue(focuses[editing_focus_id].block_allow)
    focus_monaco_cancel.setValue(focuses[editing_focus_id].block_cancel)
    focus_monaco_historical.setValue(focuses[editing_focus_id].block_historical)
    focus_monaco_tooltip.setValue(focuses[editing_focus_id].block_tooltip)
    focus_monaco_select.setValue(focuses[editing_focus_id].block_select)
    $("#submit_focus").hide();
    do_prerequisites();
}
function do_prerequisites() {
    $(".prereq").remove();
    for (int in focuses[editing_focus_id].prerequisites) {
        $(`#prereq-container`).append(`
        <div id="prereq-${int}" class="prereq prereq-${int}">
            <div id="prereq-${int}-focuses" style="display:inline;"></div>
            <button onclick="focus_edit_add_prereq_focus(${int})">+</button>
            <button onclick="focus_edit_del_prereq(${int})" style="float:right" >-</button>
        </div>
        `);
        //int2 = focuses[editing_focus_id].prerequisites[int].length-1;
        for (int2 in focuses[editing_focus_id].prerequisites[int]) {
            options = "";
            i = 0;
            first = -1;
            console.log("log 3")
            for (focus in focuses) {
                if (focus != editing_focus_id) {
                    if (focus == focuses[editing_focus_id].prerequisites[int][int2]) { //<img class="small-focus-icon" src="assets/focuses/${focusesgfx[focuses[editing_focus_id].icon]}"></img>
                        first = focus;
                        options += `<option selected id="prereq-${int}-${int2}-${focus}">${focuses[focus].name}</option>`;
                    }
                    else {
                        options += `<option id="prereq-${int}-${int2}-${focus}" value=${focus}>${focuses[focus].name}</option>`;
                    }
                    i += 1;
                }
            }
            $(`#prereq-${int}-focuses`).append(`
                <select onchange="focus_edit_change_prereq_focus(${int}, ${int2})" id="prereq-${int}-${int2}" class="prereq-${int}-${int2} prereq-${int}">#
                    ${options}
                </select>
                <button id="prereq-${int}-${int2}-del" onclick="focus_edit_del_prereq_focus(${int}, ${int2})" class="prereq-${int}-${int2} prereq-${int}">-</button>
            `);
        }
    }
}
function focus_edit_generate_id() {
    $("#focus_id").val("TAG_"+$("#focus_name").val().split(" ").join("_").toLowerCase());
}
function focus_edit_change_id() {
    if (editing_focus) {
        focuses[editing_focus_id].id = $("#focus_id").val();
        delete focusKeys[focusKeys[editing_focus_id]];
        focuses[editing_focus_id] = $("#focus_id").val();
    }
}
function focus_edit_change_name() {
    if (editing_focus) {
        focuses[editing_focus_id].name = $("#focus_name").val();
        $(`#focus-${editing_focus_id}-name`).html(focuses[editing_focus_id].name);
    }
}
function focus_edit_change_icon() {
    if (editing_focus) {
        focuses[editing_focus_id].icon = $("#focus_icon").val();
        $(`#focus-${editing_focus_id}-icon`).attr("src", `assets/focuses/${focusesgfx[focuses[editing_focus_id].icon]}` );
    }
}
function focus_edit_change_x() {
    if (editing_focus) {
        focuses[editing_focus_id].x = parseInt($("#focus_x").val());
        console.log(`Moving x to ${parseInt($("#focus_x").val())}`);
        $(`#focus-${editing_focus_id}`).css("left", `${focuses[editing_focus_id].x*96+13}px` );
        draw_focus_prerequisites(editing_focus_id);
    }
}
function focus_edit_change_y() {
    if (editing_focus) {
        focuses[editing_focus_id].y = parseInt($("#focus_y").val());
        console.log(`Moving y to ${parseInt($("#focus_y").val())}`);
        $(`#focus-${editing_focus_id}`).css("top", `${focuses[editing_focus_id].y*130}px` );
        draw_focus_prerequisites(editing_focus_id);
    }
}

var focus_monaco_available;
var focus_monaco_bypass;
var focus_monaco_reward;
var focus_monaco_allow;
var focus_monaco_cancel;
var focus_monaco_historical;
var focus_monaco_tooltip;
var focus_monaco_select;

$(document).ready(function() {
    $("#focus-gfx-panel").hide();
    for (gfx in focusesgfx) {
        $("#focus-gfx-panel-gfx").append(`
            <div class="focus-gfx" id="focus-gfx-${gfx}">
            <img onclick="focus_gfx_click('${gfx}')" class="focus-gfx-icon center" src="assets/focuses/${focusesgfx[gfx]}"></img>
            <p style="
            word-break: break-all">${gfx}</p>
            </div>
        `)
    }
    focus_edit_new_focus();

    /* #region Monaco */
    require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' }});
    window.MonacoEnvironment = { getWorkerUrl: () => proxy };

    let proxy = URL.createObjectURL(new Blob([`
        self.MonacoEnvironment = {
            baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
        };
        importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
    `], { type: 'text/javascript' }));

    require(["vs/editor/editor.main"], function () {
        monaco.languages.register({id: "hoi4script"});
        effects = [ "add_political_power", "add_stability", "add_war_support" ];
        triggers = [ "is_subject" ];
        monaco.languages.setMonarchTokensProvider("hoi4script", {
            effects, triggers,
            tokenizer: {
                root: [
                    [/[a-zA-Z0-9]{3}$/, 'number.hex'],
                    [ /@?[a-zA-Z][\w$]*/, {
                        cases: {
                            "@effects": "keyword",
                            "@triggers": "keyword",
                            "@default": "variable",
                        }
                    }],
                    [/".*?"/, "string"],
                    [/(^#.*$)/, 'comment'],
                    [/[{}]/, '@brackets'],
                    [/\d+/, 'number'],
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                ]
            }
        });
        monaco.editor.defineTheme("hoi4script-theme", {
            base: "vs",
            rules: [
                { token: "comment", foreground: "#999999" },
                { token: "string", foreground: "#009966" },
            ]
        });
        monaco.languages.registerCompletionItemProvider("hoi4script", {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    ...effects.map(k => {
                        return {
                            label: k,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: k,
                        }
                    }), ...triggers.map(k => {
                        return {
                            label: k,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: k,
                        }
                    })
                ];
                return { suggestions: suggestions };
            }
        });
        monaco.languages.setLanguageConfiguration("hoi4script", {
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '"', close: '"' },
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '"', close: '"' },
            ]
        });

        focus_monaco_available = monaco.editor.create(document.getElementById('focus_monaco_available'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });
        focus_monaco_bypass = monaco.editor.create(document.getElementById('focus_monaco_bypass'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });
        focus_monaco_reward = monaco.editor.create(document.getElementById('focus_monaco_reward'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });
        focus_monaco_allow = monaco.editor.create(document.getElementById('focus_monaco_allow'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });
        focus_monaco_cancel = monaco.editor.create(document.getElementById('focus_monaco_cancel'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });
        focus_monaco_historical = monaco.editor.create(document.getElementById('focus_monaco_historical'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });
        focus_monaco_tooltip = monaco.editor.create(document.getElementById('focus_monaco_tooltip'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });
        focus_monaco_select = monaco.editor.create(document.getElementById('focus_monaco_select'), {
            value: "",
            theme: "hoi4script-theme",
            language: 'hoi4script',
            theme: 'vs-dark',
            automaticLayout: true
        });

        focus_monaco_available.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_available = focus_monaco_available.getValue();
            }    
        });
        focus_monaco_bypass.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_bypass = focus_monaco_bypass.getValue();
            }    
        });
        focus_monaco_reward.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_reward = focus_monaco_reward.getValue();
            }    
        });
        focus_monaco_allow.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_allow = focus_monaco_allow.getValue();
            }    
        });
        focus_monaco_cancel.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_cancel = focus_monaco_cancel.getValue();
            }    
        });
        focus_monaco_historical.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_historical = focus_monaco_historical.getValue();
            }    
        });
        focus_monaco_tooltip.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_tooltip = focus_monaco_tooltip.getValue();
            }    
        });
        focus_monaco_select.getModel().onDidChangeContent((event) => {
            if (editing_focus) {
                focuses[editing_focus_id].block_select = focus_monaco_select.getValue();
            }    
        });
        monaco_init = true;
    });
    /* #endregion */
});
function focus_gfx_click(gfx) {
    console.log(gfx);
    $("#focus_icon").val(gfx);
    focus_edit_change_icon();
}
function focus_gfx_button() {
    if ($("#focus-gfx-panel").is(":hidden")) {
        $("#focus-gfx-panel").show();
        $("#focus-panel-focuses").css("left", "600px");
        $(".focus-gfx-button").html("Hide Focus GFX");
    }
    else {
        $("#focus-gfx-panel").hide();
        $("#focus-panel-focuses").css("left", "0px");
        $(".focus-gfx-button").html("View Focus GFX");
    }
}
document.onkeydown = function(e) {
    if (editing_focus) {
        switch(e.which) {
            case 37: // left
            if (parseInt($("#focus_x").val()) > 0) {
                $("#focus_x").val( parseInt($("#focus_x").val()) -1 );
            focus_edit_change_x();
            }
            break;

            case 38: // up
            if (parseInt($("#focus_y").val()) > 0) {
                $("#focus_y").val( parseInt($("#focus_y").val()) -1 );
            focus_edit_change_y();
            }
            break;

            case 39: // right
            $("#focus_x").val( parseInt($("#focus_x").val()) +1 );
            focus_edit_change_x();
            break;

            case 40: // down
            $("#focus_y").val( parseInt($("#focus_y").val()) +1 );
            focus_edit_change_y();
            break;

            case 13: //enter
            $(`#focus-${editing_focus_id}`).click();
            break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    }
};
function export_focuses() {
    localStorage.setItem("focuses", JSON.stringify(focuses));
    localStorage.setItem("focusKeys", JSON.stringify(focusKeys));
    localStorage.setItem("latestFocusID", latestFocusID);
}
function load_focuses(t_focuses, t_keys, t_id) {
    focuses = JSON.parse(localStorage.getItem("focuses"));
    focusKeys = JSON.parse(localStorage.getItem("focusKeys"));
    latestFocusID = parseInt(localStorage.getItem("latestFocusID"));

    for (focus in focuses) {
        draw_focus_prerequisites(focus);
        $("#focus-panel-focuses").append(`<div onclick="focus_click(${focuses[focus].internalID})" class="focus" id="focus-${focuses[focus].internalID}" style="left: ${focuses[focus].x*96+13}px; top: ${focuses[focus].y*130}px">
        <img class="center" style="position: absolute; top: 40px" src="assets/focus_unavailable_bg.png" />
        <p id="focus-${focuses[focus].internalID}-name" class="center" style="position: absolute; top: 76px; font-size: 14px">${focuses[focus].name}</p>
        <img id="focus-${focuses[focus].internalID}-icon" class="focus-icon center" style="position: absolute; top: -44px" src="assets/focuses/${focusesgfx[focuses[focus].icon]}" />
        </div>`);
    }
}

function focus_edit_add_prereq_focus(int) {
    i = 0;
    first = -1;
    for (focus in focuses) {
        if (focus != editing_focus_id) {
            if (i == 0) {
                first = focus;
            }
            i += 1;
        }
    }
    focuses[editing_focus_id].prerequisites[int].push(parseInt(first));
    focuses[first].reverse_prerequisites.push(parseInt(editing_focus_id));
    do_prerequisites();
    draw_focus_prerequisites(editing_focus_id);
}

function focus_edit_add_prereq() {
    int = focuses[editing_focus_id].prerequisites.length;
    focuses[editing_focus_id].prerequisites.push([]);
    do_prerequisites();
    focus_edit_add_prereq_focus(int);
}

function focus_edit_change_prereq_focus(int, int2) {
    old_prereq = focuses[editing_focus_id].prerequisites[int][int2];
    if (focuses[editing_focus_id].prerequisites[int].length == 1) {
        focuses[old_prereq].reverse_prerequisites.splice(focuses[old_prereq].reverse_prerequisites.indexOf(editing_focus_id, 1));
        focuses[parseInt($(`#prereq-${int}-${int2}`).val())].reverse_prerequisites.push(parseInt(editing_focus_id));
    }
    else {
        focuses[old_prereq].reverse_or_prerequisites.splice(focuses[old_prereq].reverse_prerequisites.indexOf(editing_focus_id, 1));
    }
    focuses[editing_focus_id].prerequisites[int][int2] = parseInt($(`#prereq-${int}-${int2}`).val());
    draw_focus_prerequisites(editing_focus_id);
}

function focus_edit_del_prereq_focus(int, int2) {
    old_prereq = focuses[editing_focus_id].prerequisites[int][int2];
    if (focuses[editing_focus_id].prerequisites[int].length == 1) {
        focuses[old_prereq].reverse_prerequisites.splice(focuses[old_prereq].reverse_prerequisites.indexOf(editing_focus_id, 1));
    }
    else {
        focuses[old_prereq].reverse_or_prerequisites.splice(focuses[old_prereq].reverse_or_prerequisites.indexOf(editing_focus_id, 1));
    }
    focuses[editing_focus_id].prerequisites[int].splice(int2, 1);
    do_prerequisites();
    draw_focus_prerequisites(editing_focus_id);
}

function focus_edit_del_prereq(int) {
    for (focus of focuses[editing_focus_id].prerequisites[int]) {
        if (focuses[editing_focus_id].prerequisites[int].length == 1) {
            focuses[focus].reverse_prerequisites.splice(focuses[focus].reverse_prerequisites.indexOf(editing_focus_id, 1));
        }
        else {
            focuses[focus].reverse_or_prerequisites.splice(focuses[focus].reverse_or_prerequisites.indexOf(editing_focus_id, 1));
        }
    }
    focuses[editing_focus_id].prerequisites.splice(int, 1);
    $(`.prereq-${int}`).remove();
    do_prerequisites();
    draw_focus_prerequisites(editing_focus_id);
}

