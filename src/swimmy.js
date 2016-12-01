'use strict';

const $ = require('jquery');

const electron = require('electron');
const remote = electron.remote;
const dialog = remote.dialog;
const BrowserWindow = remote.BrowserWindow;

const path = require('path');
const dcmp = require('./../src/docker_compose');


$(() => {
    let selected_dcmp_file_path = null;
    let elem_dcmp_dir_path = $('#dcmp_dir_path');
    let elem_dcmp_yml_file = $('#dcmp_yml_file');

    let btn_dcmp_up         = $('#dcmp_up');
    let btn_dcmp_pause      = $('#dcmp_pause');
    let btn_dcmp_stop       = $('#dcmp_stop');
    let btn_dcmp_restart    = $('#dcmp_restart');
    let btn_dcmp_down       = $('#dcmp_down');

    let elem_status         = $('#runtime_info_contents #status');
    let elem_logs           = $('#runtime_info_contents #logs');

    let set_dcmp_btns_enable = (targets, is_able = true) => {
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
                    $(elem).prop('disabled', !is_able);
                }
            }
        });
    };
    // set_dcmp_btns_enable('all', false); // init by all disabled.

    let get_proj_info = () => {
        let proj_path = elem_dcmp_dir_path.html();
        let dcmp_yml = elem_dcmp_yml_file.html();
        if (proj_path == 'none' || dcmp_yml == 'none') {
            return null;
        }
        return {path: proj_path, yml: dcmp_yml};
    };

    let exec_dcmp_ps = () => {
        if (selected_dcmp_file_path == null) {
            console.log('exec_dcmp_ps: you need to select a docker-compose.yml first.');
            return;
        }
        dcmp.ps(selected_dcmp_file_path, (result) => {
            // Build html
            let out_html = '<table class="table">';
            out_html += '<thead><tr><th>#</th>';
            for (let i = 0; i < result[0].length; ++i) {
                out_html += '<th>' + result[0][i] + '</th>';
            }
            out_html += '</tr></thead>';
            out_html += '<tbody>';
            for (let i = 1; i < result.length; ++i) {
                out_html += '<tr><th>' + i + '</th>';
                for (let k = 0; k < result[i].length; ++k) {
                    out_html += '<td>' + result[i][k] + '</td>';
                }
                out_html += '</tr>';
            }
            out_html += '</tbody></table>';
            elem_status.html(out_html);
        });
    };

    let exec_dcmp_logs = () => {
        if (selected_dcmp_file_path == null) {
            console.log('exec_dcmp_logs: you need to select a docker-compose.yml first.');
            return;
        }
        dcmp.logs(selected_dcmp_file_path, (stdout) => {
            exec_dcmp_ps();
            elem_logs.html(`<code>${stdout}</code>`);
        });
    };

    let exec_dcmp_up = () => {
        if (selected_dcmp_file_path == null) {
            console.log('exec_dcmp_up: you need to select a docker-compose.yml first.');
            return;
        }
        dcmp.up(selected_dcmp_file_path, (result) => {
            exec_dcmp_ps();
        });
    };

    let exec_dcmp_stop = () => {
        if (selected_dcmp_file_path == null) {
            console.log('exec_dcmp_stop: you need to select a docker-compose.yml first.');
            return;
        }
        dcmp.stop(selected_dcmp_file_path, (result) => {
            exec_dcmp_ps();
        });
    };

    // docker-compose.yml selector.
    $('#dcmposer_selector').click(() => {
        dialog.showOpenDialog(null, {
            properties: ['openFile'],
            title: 'Select docker-compose.yml',
            defaultPath: '.',
            filters: [{name: 'docker-compose.yml', extensions: ['yml']}]
        }, (file_paths) => {
            if (file_paths && file_paths.length > 0) {
                let file_path = file_paths[0];
                selected_dcmp_file_path = file_path;
                elem_dcmp_dir_path.html(path.dirname(file_path));
                elem_dcmp_yml_file.html(path.basename(file_path));

                // TODO:check the status using dcmp ps
                set_dcmp_btns_enable(['up','down'], true);
            }
        });
    });
    // docker-compose.yml canceler.
    $('#dcmposer_resetter').click(() => {
        elem_dcmp_dir_path.html('none');
        elem_dcmp_yml_file.html('none');
    });

    // docker-compose command button.
    btn_dcmp_up.click(() => {
        console.log('btn_dcmp_up clicked');
        exec_dcmp_up();
    });
    btn_dcmp_pause.click(() => {
        console.log('btn_dcmp_pause clicked');
    });
    btn_dcmp_stop.click(() => {
        console.log('btn_dcmp_stop clicked');
        exec_dcmp_stop();
    });
    btn_dcmp_restart.click(() => {
        console.log('btn_dcmp_restart clicked');
    });
    btn_dcmp_down.click(() => {
        console.log('btn_dcmp_down clicked');
    });

    // Runtime Info Tabs.
    $('#runtime_info_panel #runtime_info_tabs a').click((event) => {
        event.preventDefault();
        $(this).tab('show');

        // Execute tab
        if (event.target.id == 'status-tab') {
            exec_dcmp_ps();
        } else if (event.target.id == 'logs-tab') {
            exec_dcmp_logs(); // TODO: is it possible to support follow options?
        }
    });
});

