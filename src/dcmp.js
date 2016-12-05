/*!
 * dcmp
 *
 * MIT Licensed
 */
'use strict';


/**
 * Module dependencies.
 * @private
 */
const dialog = remote.dialog;
const path = require('path');
const exec = require('child_process').exec;

function getDockerComposeCommandPath(platform) {
    const DOCKER_COMPOSE_PATH_LINUX     = '/usr/bin/docker-compose';
    const DOCKER_COMPOSE_PATH_DARWIN    = '/usr/local/bin/docker-compose';
    const DOCKER_COMPOSE_PATH_WIN32     = 'docker-compose';

    if (platform === 'win32') {
        return DOCKER_COMPOSE_PATH_WIN32;
    } else if (platform === 'darwin') {
        return DOCKER_COMPOSE_PATH_DARWIN;
    }
    return DOCKER_COMPOSE_PATH_LINUX
}

function DockerCompose(platform) {
    this.dcmp_path = getDockerComposeCommandPath(process.platform);
}

DockerCompose.prototype.parseStdout = (cmd, stdout) => {
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
};


//------------------------------------------------------------------------------
//  docker-compose command wrapper functions
//------------------------------------------------------------------------------

DockerCompose.prototype.ps = (dcmp_file_path, callback) => {
    const work_dir = path.dirname(dcmp_file_path);
    exec(dcmp('ps'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose ps`', error);
            return;
        }
        let out = parseStdout('ps', stdout);
        if (callback) callback(out);
    });
};



