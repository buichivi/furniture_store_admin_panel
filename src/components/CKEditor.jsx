import useAuthStore from '@/stores/authStore';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Bold,
    Essentials,
    Italic,
    Mention,
    Paragraph,
    Undo,
    Image,
    ImageInsertViaUrl,
    ImageInsert,
    Heading,
    BlockQuote,
    Font,
    FontBackgroundColor,
    FontFamily,
    List,
    ListProperties,
    FontSize,
    FontColor,
    AdjacentListsSupport,
    ImageResizeEditing,
    ImageResizeHandles,
    ImageToolbar,
    ImageStyle,
    ImageCaption,
    ImageResize,
    LinkImage,
    Alignment,
    Base64UploadAdapter,
    SimpleUploadAdapter,
    Indent,
    IndentBlock,
} from 'ckeditor5';
import { useEffect, useState } from 'react';

const Editor = ({ initialValue = '', onChange }) => {
    const [content, setContent] = useState(initialValue);
    const [editor, setEditor] = useState();
    const [imageUrlList, setImageUrlList] = useState([]);
    const [imageSet] = useState(new Set());
    const { token } = useAuthStore();

    useEffect(() => {
        const listSrc = Array.from(
            new DOMParser()
                .parseFromString(editor?.getData(), 'text/html')
                .querySelectorAll('img'),
        )
            .map((img) => img.getAttribute('src'))
            .filter((item) => item != null);
        for (const src of listSrc) {
            if (!imageSet.has(src)) {
                imageSet.add(src);
            }
        }
        setImageUrlList(Array.from(imageSet.values()));
    }, [content, editor]);

    useEffect(() => {
        const listSrc = Array.from(
            new DOMParser()
                .parseFromString(editor?.getData(), 'text/html')
                .querySelectorAll('img'),
        )
            .map((img) => img.getAttribute('src'))
            .filter((item) => item != null);
        onChange({ content, listSrc, imageUrlList });
    }, [content, editor]);

    useEffect(() => {
        editor?.setData(initialValue);
    }, [initialValue, editor]);

    console.log('Re-render');

    return (
        <CKEditor
            editor={ClassicEditor}
            config={{
                toolbar: {
                    items: [
                        'undo',
                        'redo',
                        '|',
                        'heading',
                        'bold',
                        'italic',
                        '|',
                        'fontSize',
                        'fontFamily',
                        'fontColor',
                        'fontBackgroundColor',
                        '|',
                        'blockQuote',
                        'insertImage',
                        '|',
                        'alignment',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'outdent',
                        'indent',
                    ],
                },
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true,
                    },
                },
                plugins: [
                    Bold,
                    Essentials,
                    Italic,
                    Mention,
                    Paragraph,
                    Undo,
                    Image,
                    ImageInsert,
                    ImageInsertViaUrl,
                    // Base64UploadAdapter,
                    Heading,
                    BlockQuote,
                    List,
                    ListProperties,
                    Font,
                    FontBackgroundColor,
                    FontFamily,
                    FontSize,
                    FontColor,
                    AdjacentListsSupport,
                    ImageResizeEditing,
                    ImageResizeHandles,
                    ImageToolbar,
                    ImageStyle,
                    ImageCaption,
                    Image,
                    ImageResize,
                    LinkImage,
                    Alignment,
                    SimpleUploadAdapter,
                    Indent,
                    IndentBlock,
                ],
                simpleUpload: {
                    // The URL that the images are uploaded to.
                    uploadUrl: `${import.meta.env.VITE_BASE_URL}/blogs/images`,

                    // Enable the XMLHttpRequest.withCredentials property.
                    withCredentials: true,

                    // Headers sent along with the XMLHttpRequest to the upload server.
                    headers: {
                        'X-CSRF-TOKEN': 'CSRF-Token',
                        Authorization: `Bearer ${token}`,
                    },
                },
                image: {
                    insert: {
                        type: 'auto',
                    },
                    resizeOptions: [
                        {
                            name: 'resizeImage:original',
                            value: null,
                            label: 'Original',
                        },
                        {
                            name: 'resizeImage:custom',
                            label: 'Custom',
                            value: 'custom',
                        },
                        {
                            name: 'resizeImage:40',
                            value: '40',
                            label: '40%',
                        },
                        {
                            name: 'resizeImage:60',
                            value: '60',
                            label: '60%',
                        },
                    ],
                    toolbar: [
                        {
                            name: 'imageStyle:customDropdown',
                            title: 'Image align',
                            items: [
                                'imageStyle:alignLeft',
                                'imageStyle:alignCenter',
                                'imageStyle:alignRight',
                            ],
                            defaultItem: 'imageStyle:alignLeft',
                        },
                        'resizeImage',
                        '|',
                        'toggleImageCaption',
                        'imageTextAlternative',
                    ],
                },
            }}
            data={content}
            onChange={(e, _editor) => {
                setContent(_editor.getData());
            }}
            onReady={(_editor) => {
                console.log('Ready');
                setEditor(_editor);
            }}
            onError={(error) => {
                console.log(error);
            }}
        />
    );
};

const TextEditor = ({ initialValue = '', onChange }) => {
    const [editor, setEditor] = useState();
    const [content, setContent] = useState(initialValue);

    useEffect(() => {
        onChange({ content });
    }, [content]);

    useEffect(() => {
        editor?.setData(initialValue);
    }, [initialValue, editor]);

    return (
        <CKEditor
            editor={ClassicEditor}
            config={{
                toolbar: {
                    items: [
                        'undo',
                        'redo',
                        '|',
                        'heading',
                        'bold',
                        'italic',
                        '|',
                        'fontSize',
                        'fontFamily',
                        'fontColor',
                        'fontBackgroundColor',
                        '|',
                        'alignment',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'outdent',
                        'indent',
                    ],
                },
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true,
                    },
                },
                plugins: [
                    Bold,
                    Essentials,
                    Italic,
                    Mention,
                    Paragraph,
                    Undo,
                    Image,
                    ImageInsert,
                    ImageInsertViaUrl,
                    // Base64UploadAdapter,
                    Heading,
                    List,
                    ListProperties,
                    Font,
                    FontBackgroundColor,
                    FontFamily,
                    FontSize,
                    FontColor,
                    AdjacentListsSupport,
                    Alignment,
                    Indent,
                    IndentBlock,
                ],
            }}
            data={content}
            onChange={(e, _editor) => {
                setContent(_editor.getData());
            }}
            onReady={(_editor) => {
                console.log('Ready');
                setEditor(_editor);
            }}
            onError={(error) => {
                console.log(error);
            }}
        />
    );
};

export default Editor;
export { TextEditor };
