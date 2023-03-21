import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
// import pdfParse from 'pdf-parse'
// import fs from 'fs'
// import multer from 'multer'
// import nextConnect from 'next-connect'
// import WordExtractor from 'word-extractor'
import { Configuration, OpenAIApi } from 'openai'

const reader = require('any-text')

require('dotenv').config()

// interface BufferedFile extends File {
// 	buffer: Buffer
// }

// declare module 'next' {
// 	export interface NextApiRequest {
// 		file: BufferedFile
// 	}
// }

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

// const upload = multer({
// 	storage: multer.memoryStorage(),
// 	limits: { fileSize: 1e6 },
// 	fileFilter: (req, file, cb) => {
// 		if (
// 			file.mimetype !==
// 			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
// 		) {
// 			return cb(new Error('Invalid file type'))
// 		}
// 		return cb(null, true)
// 	},
// })

// const apiRoute = nextConnect({
// 	// Handle any other HTTP method
// 	onNoMatch(req: NextApiRequest, res: NextApiResponse) {
// 		res.status(405).json({ error: `Method '${req.method}' Not Allowed` })
// 	},
// })

// apiRoute.use(upload.single('file'))

// apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
// 	const file = req.body
// 	try {
// 		if (!file) {
// 			res.status(400).send('No file uploaded.')
// 			return
// 		}
// 		// const extractor = new WordExtractor()
// 		// const text = await extractor.extract(file.buffer)
// 		console.log(file)

// 		res.status(200).send('File uploaded.')
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).send('Error uploading file.')
// 	}
// })

// export default apiRoute

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

	// 	upload.single('file')(req, res, (err: any) => {
	// 		if (err) {
	// 			console.error(err)
	// 			res.status(500).send('Error uploading file.')
	// 			return
	// 		}

	// 		const file = req.file

	// 		try {
	// 			if (!file) {
	// 				res.status(400).send('No file uploaded.')
	// 				return
	// 			}

	// 			// assuming the file is a text document
	// 			const text = file.buffer.toString('utf-8')
	// 			console.log(text)

	// 			res.status(200).send('File uploaded.')
	// 		} catch (error) {
	// 			console.error(error)
	// 			res.status(500).send('Error uploading file.')
	// 		}
	// 	})
	// }

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
