'use client'
// import Image from 'next/image'
// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useState } from 'react'

// const inter = Inter({ subsets: ['latin'] })

interface Props {}

const DragAndDrop: React.FC<Props> = () => {
	const [isDragging, setIsDragging] = useState(false)
	const [file, setFile] = useState<File | null>(null)

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

	const [text, setText] = useState('')

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData()
		// console.log('this is file:', file)
		// console.log('this is test:', text)
		formData.append('file', file as Blob)
		formData.append('text', text)
		console.log(file)
		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			})
			// console.log(response)
			if (!response.ok) {
				throw new Error('Failed to submit form data')
			}

			console.log('Form data submitted successfully')
		} catch (error) {
			console.error(error)
		}
		// Do something with the submitted text, e.g. send it to a server
		// console.log(`Submitted text: ${text}`)
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setText(e.target.value)
	}

	return (
		<main className={styles.main}>
			<h1>🔥Cover Letter Generator🔥</h1>

			<form onSubmit={handleSubmit}>
				<div
					className={`drag-and-drop-container ${isDragging ? 'dragging' : ''}`}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<p>
						Drag and drop your PDF or Word Resume here, or click to browse local
						files.
					</p>
					<input
						type="file"
						accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
						onChange={handleFileChange}
					/>
					{file && (
						<div>
							<p>{file.name}</p>
						</div>
					)}
				</div>
				<div>
					<label htmlFor="text-input">Paste Job Description:</label>
					<input
						type="text"
						id="text-input"
						value={text}
						onChange={handleInputChange}
						className={styles.textBox}
					/>
				</div>
				<button type="submit">Submit</button>
			</form>
		</main>
	)
}

export default DragAndDrop
