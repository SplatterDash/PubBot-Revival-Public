const path = require('node:path');

module.exports = {
	AssetPathAbsolute: path.resolve(__dirname, '..', '..', 'assets'),
	AssetPathRelative: path.join('..', '..', 'assets'),
};