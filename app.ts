/// <reference path="./typings/node/node.d.ts"/>
/// <reference path="./typings/lodash/lodash.d.ts"/>
/// <reference path="./typings/bennu/bennu.d.ts"/>
/// <reference path="./parsers/index.ts"/>
/// <reference path="./renderers/index.ts"/>

const _ = require('lodash');
import { parse, lang, text } from 'bennu';

const fs    = require('fs-extra');
const wrap  = require('wordwrap');

const validTargets = [ 'cc', 'cs6' ];
const target       = process.argv[2];
if (_.contains(validTargets, target) == false) {
    console.error(target
        ? `Invalid target: '${target}'`
        : `No target specified!`
    );
    console.error(
        `Valid targets are: ${
          _.map(validTargets, target => `'${target}'`).join(', ')
        }`
    );
    process.exit(1);
}

console.log(`Processing 'Adobe Photoshop ${target.toUpperCase()}'...`)

import * as parsers   from './parsers/index';
import * as renderers from './renderers/index';
import renderTypescriptFile = renderers.renderTypescriptFile;

const chapter2 = fs.readFileSync(`assets/${target}/chapter-2.txt`, 'utf8');
const chapter4 = fs.readFileSync(`assets/${target}/chapter-4.txt`, 'utf8');

const compileTypes = output =>
    _([chapter2])
        .map(input => {
            console.log('Parsing types...');
            return parsers.parseTypes(input)
        })
        .map(types => {
            console.log('Rendering types...');
            return renderTypescriptFile(
                  []
                , renderers.renderTypes
                , types
            );
        })
        .each(contents => {
            console.log('Emitting types...');
            fs.writeFile(output, contents);
        })
    ;

const compileConstants = output =>
    _([chapter4])
        .map(input => {
            console.log('Parsing constants...');
            return parsers.parseConstants(input)
        })
        .map(constants => {
            console.log('Rendering constants...');
            return renderTypescriptFile(
                  []
                , renderers.renderConstants
                , constants
            );
        })
        .each(contents => {
            console.log('Emitting constants...');
            fs.writeFile(output, contents);
        })
    ;

const copyDistFiles = targetDir => {
    console.log('Copying files...');
    fs.copySync('ps.d.ts', `${targetDir}/ps.d.ts`)
    fs.copySync('assets/lib.d.ts', `${targetDir}/lib.d.ts`)
    fs.copySync('extendscript/es.d.ts', `${targetDir}/es.d.ts`)
    fs.copySync('extendscript/es.dollar.d.ts', `${targetDir}/es.dollar.d.ts`)
    fs.copySync('extendscript/es.file.d.ts', `${targetDir}/es.file.d.ts`)
    fs.copySync('extendscript/es.global.d.ts', `${targetDir}/es.global.d.ts`)
}

const mkDistDir = (targetDir) => {
    console.log('Making dir...');
    try {
      fs.mkdirsSync(targetDir);
    } catch (e) {}
    return targetDir;
}

try {
    const distDir = mkDistDir(`dist/${target}`);
    compileTypes(`${distDir}/ps.types.d.ts`);
    compileConstants(`${distDir}/ps.constants.d.ts`);
    copyDistFiles(distDir)
} catch(e) {
    console.error('ERROR', e);
    console.error('STACK', e.stack);
}
