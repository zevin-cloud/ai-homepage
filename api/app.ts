/**
 * API 服务器主文件
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import maxkbRoutes from './routes/maxkb.js'
import userRoutes from './routes/user.js'

// ESM 模式下获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(cookieParser()) // Add cookie-parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API 路由
 */
app.use('/api/auth', authRoutes)
app.use('/api/maxkb', maxkbRoutes)
app.use('/api/users', userRoutes)

/**
 * 健康检查接口
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * 静态文件服务 - 前端构建产物
 */
app.use(express.static(path.join(__dirname, '../dist')))

/**
 * 前端路由处理 - 所有非 API 请求返回 index.html
 */
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

/**
 * 错误处理中间件
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', error); // Log error for debugging
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

export default app
