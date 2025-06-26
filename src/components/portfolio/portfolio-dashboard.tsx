'use client'

import { useState, useEffect } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { lamportsToSol } from 'gill'
import { useGetBalanceQuery } from '@/components/account/account-data-access'
import Image from 'next/image'
import {
  Wallet,
  Coins,
  TrendingUp,
  RefreshCw,
  Link,
  AlertCircle,
  Loader2,
  DollarSign,
  BarChart3,
  Activity,
} from 'lucide-react'

interface PortfolioData {
  balance: number
  tokens: TokenInfo[]
  totalValue: number
}

interface TokenInfo {
  mint: string
  amount: string
  decimals: number
  symbol?: string
}

// Logo component with circular background
const Logo = ({ size = 'default', className = '' }: { size?: 'sm' | 'default' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    default: 'h-12 w-12 p-2',
    lg: 'h-16 w-16 p-3',
  }

  const imageSizes = {
    sm: { width: 20, height: 20 },
    default: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 to-violet-700 dark:from-purple-500 dark:to-violet-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-200 dark:ring-purple-800 ${className}`}
    >
      <Image
        src="/third-time-icon-tiny-white.png"
        alt="Third Time"
        width={imageSizes[size].width}
        height={imageSizes[size].height}
        className="object-contain"
        priority
      />
    </div>
  )
}

// Enhanced Loading Components
const LoadingSpinner = ({
  size = 'default',
  className = '',
}: {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-600 dark:text-purple-400`} />
    </div>
  )
}

const PulsingDot = () => (
  <div className="flex items-center gap-1">
    <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
    <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
    <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
  </div>
)

const LoadingBar = ({ progress = 0 }: { progress?: number }) => (
  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 overflow-hidden">
    <div
      className="bg-gradient-to-r from-purple-500 to-violet-600 h-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
)

const ActivityIndicator = ({ isActive, label }: { isActive: boolean; label: string }) => (
  <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
    <Activity className={`h-4 w-4 ${isActive ? 'animate-pulse text-green-500' : 'text-gray-400'}`} />
    <span className={isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>{label}</span>
  </div>
)

const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 dark:from-purple-700 dark:via-purple-600 dark:to-purple-700 rounded bg-[length:200%_100%] animate-[shimmer_2s_infinite] ${className}`}
  />
)

export function PortfolioDashboard() {
  const { account, cluster } = useWalletUi()
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    balance: 0,
    tokens: [],
    totalValue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string>('')

  const balanceQuery = useGetBalanceQuery({
    address: account?.address!,
  })

  useEffect(() => {
    if (account && balanceQuery.data?.value !== undefined) {
      fetchPortfolioData()
    }
  }, [account, balanceQuery.data?.value])

  const fetchPortfolioData = async () => {
    if (!account) return

    setIsLoading(true)
    setError('')
    setLoadingProgress(0)

    try {
      setLoadingProgress(25)
      await new Promise((resolve) => setTimeout(resolve, 300))

      setLoadingProgress(50)
      const mockTokens: TokenInfo[] = [
        { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', amount: '1000', decimals: 6, symbol: 'USDC' },
        { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', amount: '500', decimals: 6, symbol: 'USDT' },
      ]

      setLoadingProgress(75)
      await new Promise((resolve) => setTimeout(resolve, 300))

      const solBalance = balanceQuery.data?.value ? lamportsToSol(balanceQuery.data.value) : 0

      setLoadingProgress(100)
      setPortfolio({
        balance: solBalance,
        tokens: mockTokens,
        totalValue: calculateTotalValue(mockTokens),
      })

      setTimeout(() => setLoadingProgress(0), 500)
    } catch (err) {
      setError('Failed to load portfolio data')
      console.error('Portfolio fetch error:', err)
      setLoadingProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotalValue = (tokens: TokenInfo[] = portfolio.tokens) => {
    return tokens.reduce((total, token) => {
      return total + parseFloat(token.amount)
    }, 0)
  }

  const formatBalance = (balance: number | string | undefined | null) => {
    if (balance === undefined || balance === null) return '0.0000'
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance
    if (isNaN(numBalance)) return '0.0000'
    return numBalance.toFixed(4)
  }

  const refetchData = async () => {
    setIsRefreshing(true)
    try {
      await balanceQuery.refetch()
      await fetchPortfolioData()
    } catch (err) {
      setError('Failed to refresh data')
      console.error('Refetch error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 p-4 flex flex-col items-center justify-center">
        {/* Logo with circular background for wallet connection screen */}
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-purple-800 dark:text-purple-200">
            Portfolio Dashboard
          </h1>
          <div className="bg-purple-100 dark:bg-purple-800 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-center mb-4">
              <Link className="h-8 w-8 text-purple-600 dark:text-purple-300" />
            </div>
            <p className="text-lg font-semibold text-purple-700 dark:text-purple-200 mb-4">Connect Your Wallet</p>
            <p className="text-purple-600 dark:text-purple-300">
              Please connect your Solana wallet to view your cryptocurrency portfolio
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isInitialLoading = balanceQuery.isLoading && !portfolio.balance
  const hasData = portfolio.balance > 0 || portfolio.tokens.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Loading Progress Bar */}
        {(isLoading || isRefreshing) && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <LoadingBar progress={isRefreshing ? 100 : loadingProgress} />
          </div>
        )}

        {/* Header with Logo for main portfolio view */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            {isInitialLoading ? (
              <div className="h-12 w-12 bg-purple-200 dark:bg-purple-700 rounded-full animate-pulse" />
            ) : (
              <Logo size="default" />
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-200">My Portfolio</h1>
          </div>
          <div className="flex items-center gap-4">
            <ActivityIndicator
              isActive={isLoading || isRefreshing || balanceQuery.isFetching}
              label={isLoading ? 'Loading...' : isRefreshing ? 'Refreshing...' : 'Connected'}
            />
            <div className="text-sm text-purple-600 dark:text-purple-300">
              Network: <span className="font-semibold">{cluster.label}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-purple-800 dark:text-purple-200 flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                SOL Balance
                {(isLoading || balanceQuery.isFetching) && <PulsingDot />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isInitialLoading ? (
                <div className="space-y-3">
                  <LoadingSkeleton className="h-12 w-full" />
                  <LoadingSkeleton className="h-4 w-3/4" />
                </div>
              ) : balanceQuery.isError ? (
                <div className="text-red-500 dark:text-red-400 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="text-lg font-semibold">Error loading balance</p>
                    <Button onClick={() => balanceQuery.refetch()} variant="outline" size="sm" className="mt-2">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isLoading && <LoadingSpinner size="sm" />}
                    <p className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300">
                      {formatBalance(portfolio.balance)} SOL
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-500 dark:text-purple-400">
                    <DollarSign className="h-4 w-4" />
                    <span>${(portfolio.balance * 180).toFixed(2)} USD</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-purple-800 dark:text-purple-200 flex items-center gap-2">
                <Coins className="h-6 w-6" />
                Token Holdings
                {isLoading && <LoadingSpinner size="sm" className="ml-auto" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isInitialLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                      <LoadingSkeleton className="h-5 w-1/3" />
                      <LoadingSkeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : portfolio.tokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-purple-600 dark:text-purple-400">
                  <Coins className="h-12 w-12 mb-4 opacity-50" />
                  <p>No tokens found in wallet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.tokens.map((token, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-purple-50 dark:bg-purple-800/50 rounded-lg border border-purple-100 dark:border-purple-700 transition-all hover:shadow-sm"
                    >
                      <div className="mb-2 sm:mb-0">
                        <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                          {token.symbol || 'Unknown Token'}
                        </span>
                        <p className="text-xs text-purple-500 dark:text-purple-400 font-mono break-all sm:break-normal">
                          {`${token.mint.slice(0, 8)}...${token.mint.slice(-8)}`}
                        </p>
                      </div>
                      <span className="text-lg font-mono text-purple-600 dark:text-purple-300 self-end sm:self-auto">
                        {token.amount} {token.symbol}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Portfolio Summary
                {(isLoading || isRefreshing) && <PulsingDot />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  {isInitialLoading ? (
                    <div className="space-y-2">
                      <LoadingSkeleton className="h-12 w-48 bg-white/20" />
                      <LoadingSkeleton className="h-4 w-32 bg-white/10" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-6 w-6" />
                        <p className="text-3xl md:text-4xl font-bold">
                          ${(calculateTotalValue() + portfolio.balance * 180).toFixed(2)} USD
                        </p>
                        {isLoading && <LoadingSpinner size="sm" />}
                      </div>
                      <p className="text-purple-100">Total Portfolio Value</p>
                    </>
                  )}
                </div>
                <Button
                  onClick={refetchData}
                  disabled={isLoading || balanceQuery.isLoading || isRefreshing}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 self-end sm:self-auto disabled:opacity-50 transition-all"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefreshing || isLoading || balanceQuery.isLoading ? 'animate-spin' : ''}`}
                  />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {!hasData && !isInitialLoading && (
          <div className="text-center mt-12">
            <div className="bg-purple-100 dark:bg-purple-800/50 rounded-lg p-8 max-w-md mx-auto">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-purple-400 dark:text-purple-500" />
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">Getting Started</h3>
              <p className="text-purple-600 dark:text-purple-300 mb-4">
                Your wallet appears to be empty. Try getting some SOL from the faucet to get started.
              </p>
              <Button onClick={refetchData} variant="outline" className="border-purple-300 dark:border-purple-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
