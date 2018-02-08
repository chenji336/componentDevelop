module.exports = {
	entry: {
		animation: './src/animation.js'
	},
	output: {
		path: __dirname + '/build',
		filename: '[name].js',
		// ??下面三个参数不是很清楚意义，之后如果学习webpack的时候需要好好的了解下
		 library: 'animation'//,
		// libraryTarget: 'umd',
		// publicPath: '/assets/'
	}
};