import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import pdfParse from 'pdf-parse'
import fs from 'fs'

import { Configuration, OpenAIApi } from 'openai'

const reader = require('any-text')

require('dotenv').config()

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.ORG_ID,
})
const openai = new OpenAIApi(configuration)

// function generatePrompt(resume: string, jd: any) {
// 	return [
// 		{
// 			role: `system`,
// 			content: `You will be given a resume and job description. From the information in the resume, please create a cover letter for the role in the job description. If there are some skills required for the job description that are not in the resume, express interest in learning them.`,
// 		},
// 		{
// 			role: `user`,
// 			content: `here is my resume: "${resume}"  here is the job description: "${jd}"`,
// 		},
// 		{
// 			role: `system`,
// 			content: `Please create a cover letter from this information.`,
// 		},
// 	]
// }

const createCoverLetter = async (resume: string, jd: any) => {
	// console.log('calling openai api')
	const response = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: `system`,
				content: `You will be given a resume and job description. Using my resume as a reference, please create a cover letter for the role in the job description. If there are some skills required for the job description that are not in the resume, express interest in learning them.`,
			},
			{
				role: `user`,
				content: `here is my resume: "${resume}"  here is the job description: "${jd}"`,
			},
			{
				role: `system`,
				content: `Please compose a compelling cover letter in 200 words or less explaining why I am the best fit for this role. Use the StoryBrand Framework.`,
			},
		],
		temperature: 0.9,
		max_tokens: 1200,
	})
	// console.log(response.data.choices[0].message)
	return response.data.choices[0].message?.content
}

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
	// Make sure the method is POST
	if (req.method !== 'POST') {
		res.status(405).end()
		return
	}
	const options = { uploadDir: './uploads', keepExtensions: true }
	const form = formidable(options)

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
			// console.log(data) // handle success
			const response = await createCoverLetter(data, fields.text)
			// console.log(response) // handle success
			if (response) {
				res.status(200).json({ message: response })
				return
			}
		} catch (error) {
			console.log(error) // handle error
			res.status(500).json({ message: 'An error occurred' })
			return
		}
	})
}
