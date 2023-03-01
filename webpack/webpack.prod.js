const { merge } = require("webpack-merge")
const webpackConfig = require("./webpack.config")

const prodWebpackConfig = merge(webpackConfig, {
	mode: "production",
	target: "browserslist",
	plugins: [],
	module: {
		rules: [
			{
				test: /\.pug$/,
				exclude: "/node_modules/",
				use: [
					{
						loader: "pug3-loader",
						options: {
							pretty: false
						}
					}
				]
			},
			{
				test: /\.js$/,

				exclude: "/node_modules/",
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.tsx?$/,

				exclude: "/node_modules/",
				use: {
					loader: "ts-loader"
				}
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
				type: "asset/resource",
				generator: {
					filename: `${webpackConfig.externals.paths.assets}img/[name]-[contenthash][ext]`
				},
				use: [
					{
						loader: "image-webpack-loader",
						options: {
							mozjpeg: {
								progressive: true
							},
							optipng: {
								enabled: false
							},
							pngquant: {
								quality: [0.65, 0.9],
								speed: 4
							},
							gifsicle: {
								interlaced: false
							},
							webp: {
								quality: 75
							}
						}
					}
				]
			}
		]
	}
})
module.exports = new Promise(resolve => {
	resolve(prodWebpackConfig)
})
