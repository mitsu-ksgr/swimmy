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


/**
 * Executes `docker-compose ps`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called with the parsed output when process terminates.
 *                                                  Parsed output of `docker-compose ps` is passed to argument.
 */
exports.ps = function(docker_compose_file_path, callback) {
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

/**
 * Executes `docker-compose up -d`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
exports.up = function(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('up -d'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose up -d`', error);
            return;
        }
        console.log("---------- [docker-compose up] ----------");
        console.log("* stdout\n" + stdout);
        console.log("* stderr\n" + stderr);
        console.log("-----------------------------------------");
        if (callback) callback();
    });
};

/**
 * Executes `docker-compose stop`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
exports.stop = function(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('stop'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose stop`', error);
            return;
        }
        if (callback) callback();
    });
};

/**
 * Executes `docker-compose logs`.
 *
 * @param {string}      docker_compose_file_path    Path to docker-compose.yml
 * @param {function}    callback                    Called when process terminates.
 */
exports.logs = function(docker_compose_file_path, callback) {
    const work_dir = path.dirname(docker_compose_file_path);
    exec(dcmp('logs'), {cwd: work_dir}, (error, stdout, stderr) => {
        if (error) {
            dialog.showErrorBox('Error: failed to `docker-compose logs`', error);
            return;
        }
        if (callback) callback(stdout);
    });
};


