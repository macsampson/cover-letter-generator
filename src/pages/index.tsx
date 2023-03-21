'use client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

// import styles from '@/styles/Home.module.css'
import React, { useState } from 'react'
import Button from '@mui/material/Button'
import { TextField, CircularProgress } from '@mui/material'
import Grid from '@mui/material/Grid' // Grid version 1
import Grid2 from '@mui/material/Unstable_Grid2' // Grid version 2
import InputLabel from '@mui/material/InputLabel'
import { createTheme, ThemeProvider } from '@mui/material/styles'

// const inter = Inter({ subsets: ['latin'] })

const theme = createTheme({
	typography: {
		fontFamily: 'Roboto',
	},
})

interface Props {}

const DragAndDrop: React.FC<Props> = () => {
	const [isDragging, setIsDragging] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [text, setText] = useState('')
	const [apiResponse, setApiResponse] = useState('')
	const [loading, SetLoading] = useState(false)

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		e.dataTransfer.dropEffect = 'copy'
		setIsDragging(true)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		const { files } = e.dataTransfer
		const file = files[0]
		if (
			file.type === 'application/pdf' ||
			file.type === 'application/msword' ||
			file.type ===
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			setFile(file)
		}
		setIsDragging(false)
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { files } = e.target
		const file = files ? files[0] : null
		if (
			file &&
			(file.type === 'application/pdf' ||
				file.type === 'application/msword' ||
				file.type ===
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
		) {
			setFile(file)
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		SetLoading(true)
		const formData = new FormData()
		formData.append('file', file as Blob)
		formData.append('text', text)
		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			})
				.then((res) => res.json())
				.then((data) => {
					SetLoading(false)
					setApiResponse(data.message)
				})

			// if (!response.ok) {
			// 	throw new Error('Failed to submit form data')
			// }

			console.log('Form data submitted successfully')
			// const data = await response.json()
			// console.log(data)
			// setApiResponse(data.message)
		} catch (error) {
			console.error(error)
		}
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value)
	}

	return (
		<main>
			<ThemeProvider theme={theme}>
				<Grid2
					container
					spacing={2}
					justifyContent="center"
					padding={2}
					fontFamily="Roboto"
				>
					<h1>🔥AI Cover Letter Generator🔥</h1>
				</Grid2>
				<form onSubmit={handleSubmit}>
					<Grid2
						container
						spacing={2}
						justifyContent="center"
					>
						<Grid2 lg={6}>
							<div
								className={`drag-and-drop-container ${
									isDragging ? 'dragging' : ''
								}`}
								onDragEnter={handleDragEnter}
								onDragLeave={handleDragLeave}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							>
								<p>
									Drag and drop your PDF or Word Resume here, or browse local
									files.
								</p>
								<input
									type="file"
									accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
									onChange={handleFileChange}
								/>
								{file && <p>{file.name}</p>}
							</div>
						</Grid2>
					</Grid2>
					<Grid2
						container
						spacing={2}
						justifyContent="center"
						padding={5}
					>
						<Grid2 lg={6}>
							<InputLabel
								htmlFor="text-input"
								style={{ textAlign: 'center' }}
							>
								Job Description
							</InputLabel>
							<div id="job-description">
								{/* <label htmlFor="text-input">Job Description:</label> */}
								<TextField
									id="text-input"
									placeholder="Please paste a job description..."
									value={text}
									onChange={handleInputChange}
									// className={styles.textBox}
									multiline
									style={{ width: '100%' }}
								/>
							</div>
						</Grid2>
						<Grid2 lg={6}>
							<InputLabel
								htmlFor="text-input"
								style={{ textAlign: 'center' }}
							>
								Cover Letter
							</InputLabel>
							<TextField
								id="cover-letter-result"
								placeholder="Waiting for cover letter generation..."
								value={apiResponse}
								onChange={(e) => setApiResponse(e.target.value)}
								multiline
								style={{ width: '100%' }}
							></TextField>
							<Grid2
								container
								spacing={2}
								justifyContent="center"
							>
								<Grid2>
									<Button
										variant="contained"
										type="submit"
										color="success"
									>
										Generate Cover Letter
									</Button>
								</Grid2>
								<Grid2>
									{loading && (
										<CircularProgress
											thickness={7}
											color="success"
										/>
									)}
								</Grid2>
							</Grid2>
						</Grid2>
					</Grid2>
				</form>
			</ThemeProvider>
		</main>
	)
}

export default DragAndDrop
