import { PrimitiveAtom, useAtom } from 'jotai'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import './UploadButton.css'

interface Props {
  filesAtom: PrimitiveAtom<ArrayBuffer[]>
  loadingAtom: PrimitiveAtom<boolean>
  failedAtom: PrimitiveAtom<boolean>
}

export default function UploadButton ({ filesAtom, loadingAtom, failedAtom }: Props): JSX.Element {
  const [loading, setLoading] = useAtom(loadingAtom)
  const [failed, setFailed] = useAtom(failedAtom)
  const [, setBuffers] = useAtom(filesAtom)

  const onDrop = useCallback(async (files: File[]) => {
    return await new Promise(async (resolve) => {
      const reader = new FileReader()
      setBuffers(a => []) // empty the uploads

      setLoading(true)

      for (const file of files) {
        const res: ArrayBuffer | null = await new Promise((resolve) => {
          reader.onabort = () => {
            setLoading(false)
            console.log('file reading was aborted')
            resolve(null)
          }
          reader.onerror = (e) => {
            setLoading(false)
            setFailed(true)
            console.log('file reading has failed')
            resolve(null)
          }
          reader.onload = () => {
            setLoading(false)
            setFailed(false)
            resolve(reader.result as ArrayBuffer)
          }

          reader.readAsArrayBuffer(file)
        })
        if (res !== null) {
          setBuffers((a) => {
            a.push(res)
            return a
          })
        }
      }
    })
  }, [setBuffers, setLoading, setFailed])

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({ onDrop })

  return (
    <button {...getRootProps()} className="uploadButton flex justify-center items-center mx-auto mb-8 py-0 px-2 font-extrabold bg-inherit text-xl border-solid border-2 border-transparent hover:border-gray-800 dark:hover:border-white transition-colors ease-in-out duration-300">
      <input {...getInputProps()} />
      {
        loading
          ? <>
            <div className="spinner"></div>
            <p>loading...</p>
          </>
          : isDragActive
            ? <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
                </svg>
                <p>drop here</p>
              </>
            : failed
              ? <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFC300" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p>upload failed</p>
                </>
              : <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p>upload</p>
                </>
      }
    </button>
  )
}
