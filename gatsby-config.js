module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/docs`,
        name: 'docs-pages',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-plugin-image`,
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: './src/modules/typography.js',
        omitGoogleFont: true,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        // uncommented scope because of gatsby issue
        // https://github.com/gatsbyjs/gatsby/issues/27839
        scope: '.',
        name: 'arteigenschaften.ch',
        short_name: 'arteigenschaften',
        start_url: './',
        background_color: '#e65100',
        theme_color: '#e65100',
        display: 'minimal-ui',
        icon: 'src/images/favicon256.png',
        include_favicon: true,
        lang: 'de-CH',
        orientation: 'portrait',
        description:
          'Eigenschaften von Flora, Fauna, Moosen und Lebensräumen: Sichten, exportieren, importieren',
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        gfm: true,
        footnotes: true,
        excerpt_separator: '<!-- end -->',
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 2000,
              // uncomment this again when gatsby-plugin-manifest > 2.5.2
              //wrapperStyle: 'margin-left: 0;',
              linkImagesToOriginal: false,
            },
          },
          {
            resolve: 'gatsby-remark-autolink-headers',
            options: {
              offsetY: '64',
            },
          },
          {
            resolve: 'gatsby-remark-emojis',
            options: {
              // Deactivate the plugin globally (default: true)
              active: true,
              // Add a custom css class
              class: 'emoji-icon',
              // Select the size (available size: 16, 24, 32, 64)
              size: 32,
              // Add custom styles
              styles: {
                display: 'inline',
                margin: '0',
                'margin-top': '-3px',
                position: 'relative',
                top: '3px',
                width: '20px',
              },
            },
          },
          'gatsby-remark-copy-linked-files',
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-offline',
      options: {
        precachePages: ['/Dokumentation/', '/Dokumentation/*'],
      },
    },
  ],
}
