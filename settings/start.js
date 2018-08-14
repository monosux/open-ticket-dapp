const path = require('path');
const fs = require('fs');

const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const contracts = fs.readdirSync(resolveApp('build/contracts')).map(file => {
    return resolveApp('build/contracts/' + file);
});

module.exports = function override(config) {
    config.resolve.plugins = [new ModuleScopePlugin(resolveApp('src'), [resolveApp('package.json'), ...contracts])];

	if (process.env.NODE_ENV == 'production') {
		config.output.path = resolveApp('build/web');
		config.resolve.modules.push('build');
	}

	return config;
}
