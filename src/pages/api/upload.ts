import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { Configuration, OpenAIApi } from 'openai'
import { Transform } from 'stream'

const reader = require('any-text')
require('dotenv').config()

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.ORG_ID,
})
const openai = new OpenAIApi(configuration)

export const config = {
	api: {
		bodyParser: false,
	},
}

// Export the API route
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const form = formidable.formidable({ keepExtensions: true })

	form.parse(req, async (err, fields, files) => {
		if (err) {
			console.error(err)
			return res.status(500).end()
		}

		const file = files.file

		if (!file && !fields.text) {
			return res
				.status(400)
				.json({ message: 'Please provide both a resume and a job description' })
		}
		const resume = await reader.getText((file as any).filepath)

		// Do something with the file and text data
		try {
			// console.log(resume)

			const response = await openai
				.createChatCompletion(
					{
						model: 'gpt-3.5-turbo',
						messages: [
							{
								role: `system`,
								content: `You will be given a resume and job description. Using my resume as a reference, please create a cover letter for the role in the job description. If there are some skills required for the job description that are not in the resume, express interest in learning them.`,
							},
							{
								role: `user`,
								content: `here is my resume: "${resume}"  here is the job description: "${fields.text}"`,
							},
							{
								role: `system`,
								content: `Please compose a compelling cover letter in 200 words or less explaining why I am the best fit for this role. Use the StoryBrand Framework. Please sign off with my name.`,
							},
						],
						temperature: 0.9,
						max_tokens: 1200,
						stream: true,
					},
					{ responseType: 'stream' }
				)
				.then((resp: any) => {
					resp.data.on('data', (data: any) => {
						res.write(`${data}\n\n`)
					})
					resp.data.on('end', () => {
						console.log('stream complete')
						return res.status(200).end()
					})
				})
		} catch (error) {
			console.log(error) // handle error
			return res.status(500).json({ message: 'An error occurred' })
		}
	})
}
