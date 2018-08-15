const path = require('path');
const fs = require('fs');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const settings = require('react-scripts/config/webpack.config.prod.js');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const contracts = fs.readdirSync(resolveApp('build/contracts')).map(file => {
    return resolveApp('build/contracts/' + file);
});

settings.resolve.plugins = [new ModuleScopePlugin(resolveApp('src'), [resolveApp('package.json'), ...contracts])];

settings.output.path = resolveApp('build/app');
settings.resolve.modules.push('build');

settings.plugins[3] = new UglifyJsPlugin();

module.exports = settings;
