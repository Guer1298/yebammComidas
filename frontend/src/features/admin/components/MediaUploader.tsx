import { useState, type ChangeEvent } from 'react'
import Button from '../../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card'

interface MediaUploaderProps {
  onUpload?: (files: FileList | null) => void
}

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    const nextFiles = files ? Array.from(files) : []
    setSelectedFiles(nextFiles)
    onUpload?.(files)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir media</CardTitle>
        <CardDescription>
          Agrega imágenes o videos que fortalezcan la vitrina visual del negocio.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-orange-400 hover:bg-orange-50">
          <span className="text-base font-semibold text-slate-900">
            Arrastra archivos aquí o haz clic para seleccionar
          </span>
          <span className="mt-2 text-sm text-slate-500">
            Soporta imágenes y videos ligeros para el MVP.
          </span>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleChange}
          />
        </label>

        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              Archivos seleccionados
            </p>

            <div className="space-y-2">
              {selectedFiles.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
                >
                  {file.name}
                </div>
              ))}
            </div>

            <Button onClick={() => console.log('subir archivos')}>
              Confirmar carga
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
