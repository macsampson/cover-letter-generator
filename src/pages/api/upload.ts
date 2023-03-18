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

const createCoverLetter = async () => {
	const response = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: 'Say this is a test',
		temperature: 0,
		max_tokens: 7,
	})
	console.log(response.data)
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

		// console.log((file as any).filepath)

		// Do something with the file and text data
		reader
			.getText((file as any).filepath)
			.then(function (data: any) {
				console.log(data) // handle success
			})
			.catch(function (error: Error) {
				console.log(error) // handle error
			})
		createCoverLetter()
		res.status(200).json({ message: 'Upload successful' })
	})
}
