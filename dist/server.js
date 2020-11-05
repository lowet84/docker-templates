#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var generator_1 = require("./generator");
var YAML = require("yaml");
var fs = require("fs");
var config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var compose = generator_1.generate(config.domain, config.volumes, config.data, Object.values(config.apps));
fs.writeFileSync('docker-compose.yaml', YAML.stringify(compose), 'utf8');
