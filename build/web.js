const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const common = require('./common')

const WebpackPwaManifest = require('webpack-pwa-manifest')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = (env={}, args={}) =>
    merge(
        common(env, args),
        {
            output: {
                path: path.resolve(__dirname, '..', 'dist', 'web', env.production?'prod':'dev'),
                publicPath: '/'
            },

            optimization: {
                splitChunks: {
                    maxInitialRequests: 10,
                    cacheGroups: {
                        vendors: {
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10,
                            chunks: 'all',
                            name: 'vendors'
                        },
                        default: {
                            minChunks: 2,
                            priority: -20,
                            reuseExistingChunk: true
                        },
                        svgs: {
                            test: /[\\/]src\/.+\.svg$/,
                            chunks: 'all',
                            name: 'svgs'
                        }
                    }
                }
            },

            plugins: [
                new webpack.DefinePlugin({
                    'process.env.APP_TARGET': JSON.stringify('web')
                }),

                //Service worker
                new CopyPlugin({
                    patterns: [
                        { from: 'assets/sw.js', to: 'sw.js' },
                        { from: 'assets/robots.txt', to: 'robots.txt' },
                        { from: 'assets/_headers', to: '_headers', toType: 'file' },
                        { from: 'assets/_redirects', to: '_redirects', toType: 'file' }
                    ]
                }),

                //PWA manifest
                new WebpackPwaManifest({
                    filename: 'manifest.webmanifest',

                    name: 'Raindrop.io',
                    short_name: 'Raindrop',
                    description: 'All in One Bookmark Manager',
                    categories: ['productivity', 'news'],

                    start_url: '/',

                    display: 'standalone',
                    display_override: ['window-controls-overlay', 'minimal-ui'],
                    background_color: '#0F0F47',
                    orientation: 'any',

                    icons: [
                        {
                            src: path.resolve('src/assets/brand/macos_512.png'),
                            destination: 'assets',
                            size: '512x512',
                            purpose: 'any'
                        },
                        {
                            src: path.resolve('src/assets/brand/maskable_512.png'),
                            destination: 'assets',
                            size: '512x512',
                            purpose: 'maskable'
                        }
                    ],

                    // share_target: {
                    //     action: '/add',
                    //     method: 'GET',
                    //     params: {
                    //         title: 'title',
                    //         url: 'link'
                    //         //android not send `url` param, instead a `text` param with text and link
                    //     }
                    // },

                    related_applications: [
                        {
                            platform: 'play',
                            url: 'https://play.google.com/store/apps/details?id=io.raindrop.raindropio',
                            id: 'io.raindrop.raindropio'
                        },
                        {
                            platform: 'itunes',
                            url: 'https://apps.apple.com/app/id1021913807'
                        },
                        {
                            platform: 'chrome_web_store',
                            url: 'https://chrome.google.com/webstore/detail/ldgfbffkinooeloadekpmfoklnobpien',
                            id: 'ldgfbffkinooeloadekpmfoklnobpien'
                        }
                    ],

                    edge_side_panel: {
                        preferred_width: 400
                    }
                })
            ]
        }
    )