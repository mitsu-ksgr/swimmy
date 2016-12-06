'use strict';

const $ = require('jquery');

const electron = require('electron');
const remote = electron.remote;
const dialog = remote.dialog;
const BrowserWindow = remote.BrowserWindow;

const path = require('path');
const DockerCompose = require('./../src/docker_compose');

let dcmp = null;

// View functions.
function showDcmpErrorDialog() {
    dialog.showErrorBox(
        'ERROR: Failed to load docker_compose.yml',
        'Error: You need to select a docker-compose.yml first.');
}
function setLoading(now_loading){
    let elem_loader         = $('#loading_indicator');
    let elem_staus_content  = $('#runtime_info_contents');
    if (now_loading) {
        elem_loader.removeClass('hidden');
        elem_staus_content.addClass('hidden');
    } else {
        elem_loader.addClass('hidden');
        elem_staus_content.removeClass('hidden');
    }
}
function loadingStart()  { setLoading(true);  }
function loadingFinish() { setLoading(false); }

function setState(state) {
    $('#dcmp_state').html(state);
}
function setStatus(status) {
    $('#runtime_info_contents #status').html(status);
}
function setLogs(logs) {
    $('#runtime_info_contents #logs').html(logs);
}
function setupDcmpPathElem(dcmp_path) {
    let elem_dcmp_dir_path = $('#dcmp_dir_path');
    let elem_dcmp_yml_file = $('#dcmp_yml_file');

    if (!dcmp_path) {
        elem_dcmp_dir_path.html('None');
        elem_dcmp_yml_file.html('None');
    } else {
        elem_dcmp_dir_path.html(path.dirname(dcmp_path));
        elem_dcmp_yml_file.html(path.basename(dcmp_path));
    }
}

function foreachDcmpButtons(targets, func) {
    let all_flag = false;
    if (typeof targets == 'string' && targets.toLowerCase() == 'all') {
        all_flag = true;
    } else if (!Array.isArray(targets)) {
        targets = [targets];
    }
    $('#dcmp_control_buttons .btn').each((index, elem) => {
        let cmd = $(elem).attr('id').split('_').pop();
        for (let i = 0; i < targets.length; ++i) {
            if (all_flag || targets[i] == cmd) {
                func(elem);
            }
        }
    });
}
function setDcmpButtonsVisible(targets, is_visible = true) {
    foreachDcmpButtons(targets, (elem) => {
        if (is_visible) $(elem).show();
        else $(elem).hide();
    });
}
function setDcmpButtonsEnable(targets, is_able = true) {
    foreachDcmpButtons(targets, (elem) => {
        $(elem).prop('disabled', !is_able);
    });
}
function setupDcmpButtons(state) {
    let config = {
        'None': {
            // UP, [D]STOP, [D]RESTART, [D]DOWN
            'enabled': ['up'],
            'disabled': ['stop', 'restart', 'down'],
            'show': ['up', 'stop', 'restart', 'down'],
            'hide': ['start', 'pause', 'unpause'],
        },
        'Exit': {
            // START, [D]STOP, [D]RESTART, DOWN
            'enabled': ['start', 'down'],
            'disabled': ['stop', 'restart'],
            'show': ['start', 'stop', 'restart', 'down'],
            'hide': ['up', 'pause', 'unpause'],
        },
        'Up': {
            // PAUSE, STOP, RESTART, DOWN
            'enabled': ['pause', 'stop', 'restart', 'down'],
            'disabled': [],
            'show': ['pause', 'stop', 'restart', 'down'],
            'hide': ['up', 'start', 'unpause'],
        },
        'Paused': {
            // UNPAUSE, [D]STOP, [D]RESTART, [D]DOWN
            'enabled': ['unpause'],
            'disabled': ['stop', 'restart', 'down'],
            'show': ['unpause', 'stop', 'restart', 'down'],
            'hide': ['up', 'start', 'pause'],
        }
    };
    setDcmpButtonsEnable(config[state].enabled, true);
    setDcmpButtonsEnable(config[state].disabled, false);
    setDcmpButtonsVisible(config[state].show, true);
    setDcmpButtonsVisible(config[state].hide, false);
}

// Helper functions
function buildStatusTableHTML(status) {
    let html = '<table class="table">';
    html += '<thead><tr><th>#</th>' +
        '<th>Name</th><th>Command</th><th>State</th><th>Ports</th>';
    html += '</tr></thead><tbody>';
    for (let i = 0; i < status.length; ++i) {
        html += `<tr><th>${i}</th>` +
                    `<td>${status[i].Name}</td>` +
                    `<td>${status[i].Command}</td>` +
                    `<td>${status[i].State}</td>` +
                    `<td>${status[i].Ports}</td>` +
                    '</tr>';
    }
    html += '</tbody></table>'
    return html;
}

function fetchStatus(callback) {
    if (!dcmp) {
        showDcmpErrorDialog();
        return;
    }
    dcmp.fetchStatus((status) => {
        let state = dcmp.getState(status);
        setupDcmpButtons(state);
        setState(state);
        setStatus(buildStatusTableHTML(status));
        if (callback) callback();
    });
}
function fetchLogs(callback) {
    if (!dcmp) {
        showDcmpErrorDialog();
        return;
    }
    dcmp.logs((stdout, stderr) => {
        setLogs(`<code>${stdout}</code>`);  // TODO: setLogs関数不要
        if (callback) callback();
    });
}
function execDcmpCommand(cmd, callback) {
    if (!dcmp) {
        console.log('Error: You need to select a docker-compose.yml first.');
        return;
    }
    loadingStart();
    dcmp[cmd]((stdout, stderr) => {
        if (callback) callback(stdout, stderr);
        fetchStatus(() => { loadingFinish(); });
    });
}

$(() => {
    setDcmpButtonsVisible('all', false); // init by all hide.

    // docker-compose.yml selector.
    $('#dcmposer_selector').click(() => {
        dialog.showOpenDialog(null, {
            properties: ['openFile'],
            title: 'Select docker-compose.yml',
            defaultPath: '.',
            filters: [{name: 'docker-compose.yml', extensions: ['yml']}]
        }, (file_paths) => {
            if (file_paths && file_paths.length > 0) {
                let dcmp_file_path = file_paths[0];
                dcmp = new DockerCompose(dcmp_file_path);
                setupDcmpPathElem(dcmp_file_path);

                loadingStart();
                fetchStatus(() => { loadingFinish(); });
            }
        });
    });
    // docker-compose.yml canceler.
    $('#dcmposer_resetter').click(() => {
        setupDcmpPathElem(null);
    });

    // docker-compose command button.
    $('#dcmp_up').click(() => {
        console.log('dcmp_up button clicked');
        execDcmpCommand('up');
    });
    $('#dcmp_start').click(() => {
        console.log('dcmp_start button clicked');
        execDcmpCommand('start');
    });
    $('#dcmp_pause').click(() => {
        console.log('dcmp_pause button clicked');
        execDcmpCommand('pause');
    });
    $('#dcmp_unpause').click(() => {
        console.log('dcmp_unpause button clicked');
        execDcmpCommand('unpause');
    });
    $('#dcmp_stop').click(() => {
        console.log('dcmp_stop button clicked');
        execDcmpCommand('stop');
    });
    $('#dcmp_restart').click(() => {
        console.log('dcmp_restart button clicked');
        execDcmpCommand('restart');
    });
    $('#dcmp_down').click(() => {
        console.log('dcmp_down clicked');
        execDcmpCommand('down');
    });

    // Runtime Info Tabs.
    $('#runtime_info_panel #runtime_info_tabs a').click((event) => {
        event.preventDefault();
        $(this).tab('show');

        // Execute tab
        if (event.target.id == 'status-tab') {
            loadingStart();
            fetchStatus(() => { loadingFinish(); });
        } else if (event.target.id == 'logs-tab') {
            loadingStart();
            fetchLogs(() => { loadingFinish(); }); // TODO: is it possible to support follow options?
        }
    });
});

