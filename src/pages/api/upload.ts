import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { Configuration, OpenAIApi } from 'openai'

const reader = require('any-text')

require('dotenv').config()

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.ORG_ID,
})
const openai = new OpenAIApi(configuration)

// const createCoverLetter = async (resume: string, jd: any) => {
// 	// console.log('calling openai api')
// 	const response = await openai.createChatCompletion(
// 		{
// 			model: 'gpt-3.5-turbo',
// 			messages: [
// 				{
// 					role: `system`,
// 					content: `You will be given a resume and job description. Using my resume as a reference, please create a cover letter for the role in the job description. If there are some skills required for the job description that are not in the resume, express interest in learning them.`,
// 				},
// 				{
// 					role: `user`,
// 					content: `here is my resume: "${resume}"  here is the job description: "${jd}"`,
// 				},
// 				{
// 					role: `system`,
// 					content: `Please compose a compelling cover letter in 200 words or less explaining why I am the best fit for this role. Use the StoryBrand Framework.`,
// 				},
// 			],
// 			temperature: 0.9,
// 			max_tokens: 1200,
// 			stream: true,
// 		},
// 		{ responseType: 'stream' }
// 	)

// 	return response
// }

export const config = {
	api: {
		bodyParser: false,
	},
	// runtime: 'edge',
}

// Export the API route
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.status(405).end()
		return
	}

	const form = formidable.formidable({ keepExtensions: true })

	form.parse(req, async (err, fields, files) => {
		if (err) {
			console.error(err)
			res.status(500).end()
			return
		}
		const file = files.file
		// console.log(file)
		if (!file && !fields.text) {
			res
				.status(400)
				.json({ message: 'Please provide both a resume and a job description' })
			return
		}

		// Do something with the file and text data
		try {
			const data = await reader.getText((file as any).filepath)

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
								content: `here is my resume: "${file}"  here is the job description: "${fields.text}"`,
							},
							{
								role: `system`,
								content: `Please compose a compelling cover letter in 200 words or less explaining why I am the best fit for this role. Use the StoryBrand Framework.`,
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
						const lines = data
							.toString()
							.split('\n')
							.filter((line: any) => line.trim() !== '')
						for (const line of lines) {
							const message = line.replace(/^data: /, '')

							if (message === '[DONE]') {
								res.end()
								return
							}

							const parsed = JSON.parse(message)
							if (parsed.choices[0].delta.content) {
								// console.log(parsed)
								res.write(`${parsed.choices[0].delta.content}`)
							}
						}
					})
				})
			// response.data.on('data', (data: any) => res.write(data.toString()))
		} catch (error) {
			console.log(error) // handle error
			res.status(500).json({ message: 'An error occurred' })
			return
		}

		// default response
		// res.status(404).end()
	})
}
