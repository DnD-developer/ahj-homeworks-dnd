const { merge } = require("webpack-merge")
const webpack = require("webpack")
const webpackConfig = require("./webpack.config")

const devWebpackconfig = merge(webpackConfig, {
	mode: "development",
	target: "web",
	devServer: {
		static: {
			directory: webpackConfig.externals.paths.dist
		},
		compress: false,
		hot: false,
		client: {
			overlay: {
				warnings: false,
				errors: true
			}
		},
		port: 8081
	},
	module: {
		rules: [
			{
				test: /\.pug$/,
				exclude: "/node_modules/",
				use: [
					{
						loader: "pug3-loader",
						options: {
							pretty: true
						}
					}
				]
			},
			{
				test: /\.js$/,

				exclude: "/node_modules/",
				use: [
					{
						loader: "babel-loader"
					},
					{
						loader: "eslint-loader"
					}
				]
			},
			{
				test: /\.tsx?$/,

				exclude: "/node_modules/",
				use: [
					{
						loader: "ts-loader"
					},
					{
						loader: "eslint-loader"
					}
				]
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
				type: "asset/resource",
				generator: {
					filename: `${webpackConfig.externals.paths.assets}img/[name]-[contenthash][ext]`
				}
			}
		]
	},
	devtool: "eval-cheap-module-source-map",
	plugins: [
		new webpack.SourceMapDevToolPlugin({
			filename: "[file].map"
		})
	]
})

module.exports = new Promise(resolve => {
	resolve(devWebpackconfig)
})
