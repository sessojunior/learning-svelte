/*
// Upload de arquivos
import { fail } from '@sveltejs/kit'
import { writeFileSync } from 'fs'

export const actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData())
		const fileName = (formData.fileToUpload as File).name

		if (!fileName || fileName === 'undefined') {
			return fail(400, {
				error: true,
				message: 'Você precisa enviar um arquivo.'
			})
		}

		const { fileToUpload } = formData as { fileToUpload: File }

		// Salva o arquivo no diretório '/static/users/profiles'
		writeFileSync(`static/${fileToUpload.name}`, Buffer.from(await fileToUpload.arrayBuffer()))

		return {
			success: true
		}
	}
}
*/

// Upload e processamento de imagens do perfil do usuário
import { fail } from '@sveltejs/kit'
import { writeFileSync } from 'fs'
import sharp from 'sharp'

export const actions = {
	default: async ({ request }) => {
		try {
			const formData = Object.fromEntries(await request.formData())
			const file = formData.fileToUpload as File
			const userId = formData.userId as string

			if (!file || !userId) {
				return fail(400, { errors: [{ message: 'Arquivo e ID do usuário são obrigatórios.', code: 'missing_data' }] })
			}

			const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
			const fileExtension = file.name.split('.').pop()?.toLowerCase()
			if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
				return fail(400, { errors: [{ message: 'Formato inválido. Apenas JPG, PNG e WEBP são permitidos.', code: 'invalid_format' }] })
			}

			// Processamento da imagem
			const buffer = Buffer.from(await file.arrayBuffer())
			const image = sharp(buffer).rotate()

			const { width, height } = await image.metadata()
			if (!width || !height) {
				return fail(400, { errors: [{ message: 'Erro ao ler a imagem.', code: 'read_error' }] })
			}

			// Determina o menor lado como referência para corte quadrado
			const minSize = Math.min(width, height)
			const croppedImage = image
				.extract({ left: (width - minSize) / 2, top: (height - minSize) / 2, width: minSize, height: minSize })
				.resize(512, 512, { fit: 'cover' })
				.toFormat('webp', { quality: 90 })

			// Salvar imagem
			return saveImage(await croppedImage.toBuffer(), userId)
		} catch (error) {
			console.error('Erro ao processar a imagem:', error)
			return fail(500, { errors: [{ message: 'Erro ao processar a imagem. Tente novamente.', code: 'server_error' }] })
		}
	}
}

// Função otimizada para salvar a imagem no servidor
function saveImage(imageBuffer: Buffer, userId: string) {
	const outputPath = `static/users/profiles/${userId}.webp`
	writeFileSync(outputPath, imageBuffer)

	return {
		success: true,
		message: 'Imagem salva com sucesso!',
		filePath: `/users/profiles/${userId}.webp` // Caminho da imagem para atualização no frontend
	}
}
