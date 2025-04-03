import { json } from '@sveltejs/kit'
import { writeFileSync } from 'fs'
import sharp from 'sharp'

// Rota fazer o upload da imagem de perfil do usuário
// Configuração das dimensões e compressão da imagem
const IMAGE_WIDTH = 512 // Padrão: 512. Largura final da imagem
const IMAGE_HEIGHT = 512 // Padrão: 512. Altura final da imagem
const IMAGE_QUALITY = 75 // Padrão: 75. Qualidade de compactação (0-100) para reduzir o tamanho em bytes da imagem
const IMAGE_DIRECTORY = 'static/users/profiles'

export const POST = async ({ request }) => {
	try {
		const formData = await request.formData()
		const file = formData.get('fileToUpload') as File
		const userId = formData.get('userId') as string

		// Verifica se o arquivo e o ID do usuário estão presentes
		if (!file || !userId) {
			return json({ errors: [{ code: 'IMAGE_MISSING_DATA', message: 'Arquivo e ID do usuário são obrigatórios.' }] }, { status: 400 })
		}

		// Verifica se a extensão do arquivo é válida
		const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
		const fileExtension = file.name.split('.').pop()?.toLowerCase()
		if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
			return json({ errors: [{ code: 'IMAGE_INVALID_FORMAT', message: 'Formato inválido. Apenas JPG, PNG e WEBP são permitidos.' }] }, { status: 400 })
		}

		// Lê o arquivo e processa a imagem
		const buffer = Buffer.from(await file.arrayBuffer())
		const image = sharp(buffer).rotate()

		const { width, height } = await image.metadata()
		if (!width || !height) {
			return json({ errors: [{ code: 'IMAGE_READ_ERROR', message: 'Erro ao ler a imagem.' }] }, { status: 400 })
		}

		// Redimensiona e comprime a imagem
		const processedImage = await image.resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: 'cover' }).webp({ quality: IMAGE_QUALITY }).toBuffer()

		// Salva a imagem no diretório
		return saveImage(processedImage, userId)
	} catch (err: unknown) {
		console.error('Erro ao processar a imagem:', err)
		return json({ errors: [{ code: 'IMAGE_PROCESS_ERROR', message: 'Erro ao processar a imagem. A imagem pode estar corrompida.' }] }, { status: 400 })
	}
}

// Função para salvar a imagem no diretório
function saveImage(imageBuffer: Buffer, userId: string) {
	try {
		const outputPath = `${IMAGE_DIRECTORY}/${userId}.webp`
		writeFileSync(outputPath, imageBuffer)
		return json({ success: 'Imagem salva com sucesso!' }, { status: 200 })
	} catch (err: unknown) {
		console.error('Erro ao salvar a imagem:', err)
		return json({ errors: [{ code: 'IMAGE_SAVE_ERROR', message: 'Erro ao salvar a imagem.' }] }, { status: 500 })
	}
}
