'use strict';

const dialog = remote.dialog;
const path = require('path');
const exec = require('child_process').exec;
//const execSync = require('child_process').execSync;

// docker-compose command
const CMD_DOCKER_COMPOSE_DARWIN = '/usr/local/bin/docker-compose';
const CMD_DOCKER_COMPOSE_WIN32  = 'docker-compose';
const CMD_DCOMP = ((platform) => {
    let ret = CMD_DOCKER_COMPOSE_DARWIN;
    if (platform === 'win32') {
        ret = CMD_DOCKER_COMPOSE_WIN32;
    }
    return ret;
})(process.platform);

function dcmp(cmd) {
    return CMD_DCOMP + ' ' + cmd;
}

const State = {
    None    : 'None',       //! Warning: actually, this state is not exists in docker-compose ps.
    Exit    : 'Exit',
    Running : 'Up',
    Paused  : 'Paused',
};


/**
 * Parse docker-composer's stdout.
 *
 * @param {string}  cmd     command name.
 * @param {string}  stdout  stdout.
 */
function parseStdout(cmd, stdout) {
    const parser = {
        // docker-compose ps
        'ps': (stdout) => {
            let output_lines = stdout.trim().split('\n');
            output_lines.splice(1, 1);    // Remove '----------' line

            let ret = [];
            output_lines.forEach((line, index, ary) => {
                // split by "2 or more continius white space", just right
                ret.push(line.trim().split(/\s{2,}/));
            });
            return ret;
        },

        // docker-compose start
        'start': (stdout) => {
            return null;
        },
    };
    return (cmd in parser) ? parser[cmd](stdout) : null;
}


//------------------------------------------------------------------------------
//  docker-compose command wrapper functions
//------------------------------------------------------------------------------
/**
 * Executes `docker-compose ps`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called with the parsed output when process terminates.
 *                                                  Parsed output of `docker-compose ps` is passed to argument.
 */
function dcmp_ps(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('ps'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose ps`', error);
            return;
        }
        let out = parseStdout('ps', stdout);
        if (callback) callback(out);
    });
};
exports.ps = dcmp_ps;

/**
 * Executes `docker-compose up -d`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_up(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('up -d'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose up -d`', error);
            return;
        }
        if (callback) callback();
    });
};
exports.up = dcmp_up;

/**
 * Executes `docker-compose start`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_start(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('start'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose start`', error);
            return;
        }
        if (callback) callback();
    });
};
exports.start = dcmp_start;

/**
 * Executes `docker-compose pause`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_pause(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('pause'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose pause`', error);
            return;
        }
        if (callback) callback();
    });
};
exports.pause = dcmp_pause;

/**
 * Executes `docker-compose unpause`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_unpause(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('unpause'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose unpause`', error);
            return;
        }
        if (callback) callback();
    });
};
exports.unpause = dcmp_unpause;

/**
 * Executes `docker-compose stop`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_stop(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('stop'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose stop`', error);
            return;
        }
        if (callback) callback();
    });
};
exports.stop = dcmp_stop;

/**
 * Executes `docker-compose restart`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_restart(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('restart'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose restart`', error);
            return;
        }
        if (callback) callback();
    });
};
exports.restart = dcmp_restart;

/**
 * Executes `docker-compose down`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_down(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('down'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose down`', error);
            return;
        }
        if (callback) callback();
    });
};
exports.down = dcmp_down;

/**
 * Executes `docker-compose logs`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
function dcmp_logs(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('logs'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose logs`', error);
            return;
        }
        if (callback) callback(stdout);
    });
};
exports.logs = dcmp_logs;


//------------------------------------------------------------------------------
//  docker-compose functions
//------------------------------------------------------------------------------
/**
 * Fetch status of containers.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called with the parsed output when process terminates.
 *                                                  Parsed output of `docker-compose ps` is passed to argument.
 */
function fetchContainersStatus(docker_compose_file_path, callback) {
    dcmp_ps(docker_compose_file_path, function(result) {
        let ret = [];
        for (let i = result.length - 1; --i >= 0; ret.push({}));    // result.length - 1: remove header column.
        for (let key_idx = 0; key_idx < result[0].length; ++key_idx) {
            let key = result[0][key_idx];
            for (let i = 1; i < result.length; ++i) {
                ret[i - 1][key] = result[i][key_idx];
            }
        }
        if (callback) callback(ret);
    });
};
exports.fetchContainersStatus = fetchContainersStatus;

/**
 * get container's state.
 *
 * @param {array}   status      container's status list.
 */
function getState(status) {
    if (status.length <= 0) return State.None;
    for (let i = 0; i < status.length; ++i) {
        if (status[i].State == State.Running)   return State.Running;
        if (status[i].State == State.Paused)    return State.Paused;
    }
    return State.Exit;
};
exports.getState = getState;
