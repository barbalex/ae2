const path = require('path')

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions

  const docTemplate = path.resolve(`src/templates/docTemplate.js`)

  // sort: { frontmatter: { sort1: ASC } }  TODO: migrate gatsby v5
  let result
  try {
    result = await graphql(`
      {
        allMarkdownRemark(
          sort: { order: ASC, fields: [frontmatter___sort1] }
          limit: 1000
        ) {
          edges {
            node {
              frontmatter {
                path
              }
            }
          }
        }
      }
    `)
  } catch (error) {
    return error
  }

  const { edges } = result.data.allMarkdownRemark
  edges.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path,
      component: docTemplate,
    })
  })
}
