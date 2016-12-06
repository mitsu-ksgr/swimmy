'use strict';

// Module dependencies
const dialog = remote.dialog;
const path = require('path');
const exec = require('child_process').exec;

const DOCKER_COMPOSE_COMMAND_PATH = ((platform) => {
    const DOCKER_COMPOSE_PATH_LINUX     = '/usr/bin/docker-compose';
    const DOCKER_COMPOSE_PATH_DARWIN    = '/usr/local/bin/docker-compose';
    const DOCKER_COMPOSE_PATH_WIN32     = 'docker-compose';

    if (platform === 'win32') {
        return DOCKER_COMPOSE_PATH_WIN32;
    } else if (platform === 'darwin') {
        return DOCKER_COMPOSE_PATH_DARWIN;
    }
    return DOCKER_COMPOSE_PATH_LINUX;
})(process.platform);

const State = {
    None    : 'None',       //! Warning: actually, this state is not exists in docker-compose ps.
    Exit    : 'Exit',
    Running : 'Up',
    Paused  : 'Paused',
};


//------------------------------------------------------------------------------
//  Helper Functions
//------------------------------------------------------------------------------
function dcmp(cmd) {
    return DOCKER_COMPOSE_COMMAND_PATH + ' ' + cmd;
}

function runDcmpCommand(cmd, dcmp_file_path, callback) {
    const work_dir = path.dirname(dcmp_file_path);
    exec(dcmp(cmd), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox(`Error: failed to "docker-compose ${cmd}"`, error);
            return;
        }
        if (callback) callback(stdout, stderr);
    });
}

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
//  DockerCompose Class
//------------------------------------------------------------------------------
function DockerCompose(docker_compose_file_path) {
    this.dcmp_file_path = docker_compose_file_path;
}
module.exports = DockerCompose;

/**
 * Fetch status of containers.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called with the parsed output when process terminates.
 *                                                  Parsed output of `docker-compose ps` is passed to argument.
 */
DockerCompose.prototype.fetchStatus = function(callback) {
    runDcmpCommand('ps', this.dcmp_file_path, (stdout, stderr) => {
        let result = parseStdout('ps', stdout);
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

/**
 * get container's state.
 *
 * @param {array}   status      container's status list.
 */
DockerCompose.prototype.getState = function(status) {
    if (status.length <= 0) return State.None;
    for (let i = 0; i < status.length; ++i) {
        if (status[i].State == State.Running)   return State.Running;
        if (status[i].State == State.Paused)    return State.Paused;
    }
    return State.Exit;
};


//------------------------------------------------------------------------------
//  docker-compose command wrapper functions
//------------------------------------------------------------------------------
DockerCompose.prototype.ps = function(callback) {
    console.log("DockerCompose.prot.ps: this.dcmp_file_path = " + this.dcmp_file_path);
    runDcmpCommand('ps', this.dcmp_file_path, callback);
};
DockerCompose.prototype.logs = function(callback) {
    runDcmpCommand('logs', this.dcmp_file_path, callback);
};

DockerCompose.prototype.up = function(callback) {
    runDcmpCommand('up -d', this.dcmp_file_path, callback);
};
DockerCompose.prototype.down = function(callback) {
    runDcmpCommand('down', this.dcmp_file_path, callback);
};
DockerCompose.prototype.start = function(callback) {
    runDcmpCommand('start', this.dcmp_file_path, callback);
};
DockerCompose.prototype.restart = function(callback) {
    runDcmpCommand('restart', this.dcmp_file_path, callback);
};
DockerCompose.prototype.stop = function(callback) {
    runDcmpCommand('stop', this.dcmp_file_path, callback);
};
DockerCompose.prototype.pause = function(callback) {
    runDcmpCommand('pause', this.dcmp_file_path, callback);
};
DockerCompose.prototype.unpause = function(callback) {
    runDcmpCommand('unpause', this.dcmp_file_path, callback);
};

