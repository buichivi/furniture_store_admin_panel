import { create } from 'zustand';

const useCategoryStore = create((set) => ({
    categories: [],
    dragCate: {},
    setCategories: (categories) => set(() => ({ categories })),
    setDragCate: (cate) => set(() => ({ dragCate: cate })),
    moveCate: (parentId) =>
        set((state) => ({
            categories: state.categories.map((cate) =>
                cate._id == state.dragCate._id ? { ...cate, parentId } : cate,
            ),
        })),
}));

export default useCategoryStore;
