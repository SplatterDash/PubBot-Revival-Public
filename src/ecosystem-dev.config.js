module.exports = {
	apps : [{
		name                 : 'PubBot V2 - DEVELOPMENT',
		script               : './index.js',
		cwd                  : '.',
		kill_timeout         : 12000,
		shutdown_with_message: true,
		node_args            : '-r dotenv/config',
		args                 : 'dotenv_config_path=./.env.development',
	}],
};
