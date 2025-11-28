import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // QUAN TRỌNG: Thay đổi 'JUSpa' thành tên repository GitHub của bạn
  // Ví dụ, nếu repo của bạn là github.com/username/my-app, bạn điền '/my-app/'
  base: '/JUSpa/', 
})
