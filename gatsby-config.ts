import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `farmrpg-mod`,
    siteUrl: `https://www.yourdomain.tld`
  },
  plugins: [
    "gatsby-plugin-emotion",
    // {
    //   resolve: 'gatsby-plugin-google-analytics',
    //   options: {
    //     "trackingId": ""
    //   }
    // },
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Farm RPG Mod",
        short_name: "mod.buddy.farm",
        description: "Enhanced moderation tools for Farm RPG.",
        icon: "src/images/icon.png",
      },
    },
  ]
}

export default config
