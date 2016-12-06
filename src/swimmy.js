'use strict';

const $ = require('jquery');

const electron = require('electron');
const remote = electron.remote;
const dialog = remote.dialog;
const BrowserWindow = remote.BrowserWindow;

const path = require('path');
const DockerCompose = require('./../src/docker_compose');

$(() => {
    let dcmp = null;
    let elem_dcmp_dir_path = $('#dcmp_dir_path');
    let elem_dcmp_yml_file = $('#dcmp_yml_file');

    let btn_dcmp_up         = $('#dcmp_up');
    let btn_dcmp_start      = $('#dcmp_start');
    let btn_dcmp_pause      = $('#dcmp_pause');
    let btn_dcmp_unpause    = $('#dcmp_unpause');
    let btn_dcmp_stop       = $('#dcmp_stop');
    let btn_dcmp_restart    = $('#dcmp_restart');
    let btn_dcmp_down       = $('#dcmp_down');

    let elem_dcmp_state     = $('#dcmp_state');
    let elem_loader         = $('#loading_indicator');
    let elem_staus_content  = $('#runtime_info_contents');
    let elem_status         = $('#runtime_info_contents #status');
    let elem_logs           = $('#runtime_info_contents #logs');

    let set_loading = (now_loading) => {
        if (now_loading) {
            elem_loader.removeClass('hidden');
            elem_staus_content.addClass('hidden');
        } else {
            elem_loader.addClass('hidden');
            elem_staus_content.removeClass('hidden');
        }
    };
    let loading_start   = () => { set_loading(true);  };
    let loading_finish  = () => { set_loading(false); };

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
    let set_dcmp_btns_visible = (targets, is_visible = true) => {
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
                    if (is_visible) $(elem).show();
                    else $(elem).hide();
                }
            }
        });
    };
    set_dcmp_btns_visible('all', false); // init by all hide.

    let setup_dcmp_btns = (state) => {
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
        set_dcmp_btns_enable(config[state].enabled, true);
        set_dcmp_btns_enable(config[state].disabled, false);
        set_dcmp_btns_visible(config[state].show, true);
        set_dcmp_btns_visible(config[state].hide, false);
    };

    let build_status_table_html = (status) => {
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
    };

    let exec_dcmp_ps = (callback) => {
        if (dcmp == null) {
            console.log('exec_dcmp_ps: you need to select a docker-compose.yml first.');
            return;
        }
        dcmp.fetchStatus((status) => {
            let state = dcmp.getState(status);
            setup_dcmp_btns(state);
            elem_dcmp_state.html(state);
            elem_status.html(build_status_table_html(status));
            if (callback) callback();
        });
    };

    let exec_dcmp_logs = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_logs: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.logs((stdout) => {
            exec_dcmp_ps(() => {loading_finish()});
            elem_logs.html(`<code>${stdout}</code>`);
        });
    };

    let exec_dcmp_up = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_up: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.up((result) => {
            exec_dcmp_ps(() => {loading_finish()});
        });
    };

    let exec_dcmp_start = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_up: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.start((result) => {
            exec_dcmp_ps(() => {loading_finish()});
        });
    };

    let exec_dcmp_pause = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_pause: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.pause((result) => {
            exec_dcmp_ps(() => {loading_finish()});
        });
    };

    let exec_dcmp_unpause = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_unpause: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.unpause((result) => {
            exec_dcmp_ps(() => {loading_finish()});
        });
    };

    let exec_dcmp_stop = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_stop: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.stop((result) => {
            exec_dcmp_ps(() => {loading_finish()});
        });
    };

    let exec_dcmp_restart = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_restart: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.restart((result) => {
            exec_dcmp_ps(() => {loading_finish()});
        });
    };

    let exec_dcmp_down = () => {
        if (dcmp == null) {
            console.log('exec_dcmp_down: you need to select a docker-compose.yml first.');
            return;
        }
        loading_start();
        dcmp.down((result) => {
            exec_dcmp_ps(() => {loading_finish()});
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
                let dcmp_file_path = file_paths[0];
                dcmp = new DockerCompose(dcmp_file_path);
                elem_dcmp_dir_path.html(path.dirname(dcmp_file_path));
                elem_dcmp_yml_file.html(path.basename(dcmp_file_path));
                exec_dcmp_ps(() => {loading_finish()});
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
    btn_dcmp_start.click(() => {
        console.log('btn_dcmp_start clicked');
        exec_dcmp_start();
    });
    btn_dcmp_pause.click(() => {
        console.log('exec_dcmp_pause clicked');
        exec_dcmp_pause();
    });
    btn_dcmp_unpause.click(() => {
        console.log('exec_dcmp_unpause clicked');
        exec_dcmp_unpause();
    });
    btn_dcmp_stop.click(() => {
        console.log('btn_dcmp_stop clicked');
        exec_dcmp_stop();
    });
    btn_dcmp_restart.click(() => {
        console.log('btn_dcmp_restart clicked');
        exec_dcmp_restart();
    });
    btn_dcmp_down.click(() => {
        console.log('btn_dcmp_down clicked');
        exec_dcmp_down();
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

