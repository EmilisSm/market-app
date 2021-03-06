import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ItemsService from '../../api/service';
import ProductItem from '../../api/types/Product';
import { RootState } from '../store';

interface ProductsState {
  items: Array<ProductItem>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
  page: number;
  pageCount: number;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
  page: 1,
  pageCount: 0,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filterType: 'mug' | 'shirt' | '', { getState }) => {
    const { filter, sort, products } = getState() as RootState;
    const page = products.page;
    const sortValue = sort.sortType;
    const tags = filter.selected.tags;
    const brands = filter.selected.brands;
    // we need to resolve response promise before returing the action payload
    const response = await ItemsService.fetchProductItems({
      page,
      sortValue,
      filterType,
      tags,
      brands,
    });
    const data = await response.response;
    const total = response.total;
    return { data, total };
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = [...action.payload.data];
        state.pageCount = Math.ceil(Number(action.payload.total) / 16);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setPage } = productsSlice.actions;

export default productsSlice.reducer;
