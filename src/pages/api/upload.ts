import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import pdfParse from 'pdf-parse'
import fs from 'fs'

import { Configuration, OpenAIApi } from 'openai'

const reader = require('any-text')

require('dotenv').config()

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

function generatePrompt(resume: string, jd: any) {
	return `Please create a cover letter given the following resume and job description. If there are some skills within the job description that are not in the resume, express interest in learning them. please only mention skills that are in the resume.
			here is the resume: ${resume}
			here is the job description: ${jd}`
}

const createCoverLetter = async (resume: string, jd: any) => {
	const response = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: generatePrompt(resume, jd),
		temperature: 0.1,
		max_tokens: 1200,
	})
	// console.log(response.data.choices[0].text)
	return response.data.choices[0].text
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

	form.parse(req, (err, fields, files) => {
		if (err) {
			console.error(err)
			res.status(500).end()
			return
		}
		const file = files.file
		// console.log(file)
		if (!file && !fields.text) {
			console.log('file and text are not filled out')
			res.status(400).end()
			return
		}

		// Do something with the file and text data
		reader
			.getText((file as any).filepath)
			.then(function (data: any) {
				// console.log(data) // handle success
				const response = createCoverLetter(data, fields.text)
				console.log(response)
				res.json({ message: response })
			})
			.catch(function (error: Error) {
				console.log(error) // handle error
			})
	})
}
