module.exports = {
	apps : [{
		name                 : 'PubBot V2 - PRODUCTION',
		script               : './index.js',
		cwd                  : '.',
		kill_timeout         : 12000,
		shutdown_with_message: true,
		node_args            : '-r dotenv/config',
		args                 : 'dotenv_config_path=./.env.production',
	}],
};
