import type { GatsbySSR } from "gatsby"

import Provider from "./src/utils/context"

export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = ({ getHeadComponents }) => {
	if (process.env.NODE_ENV !== "production") return

	const headComponents = getHeadComponents() as JSX.Element[]
	headComponents.forEach(el => {
		if (el.type === "style" && el.props["data-href"]) {
			el.type = "link"
			el.props.href = el.props["data-href"]
			el.props.rel = "stylesheet"
			el.props.type = "text/css"

			delete el.props["data-href"]
			delete el.props.dangerouslySetInnerHTML
		}
	})
}

export const wrapRootElement: GatsbySSR["wrapRootElement"] = Provider
