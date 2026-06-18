import type { ReactNode } from 'react'

type Props = {
  left: ReactNode
  right: ReactNode
  children: ReactNode
}

/**
 * Shell de 3 colunas do feed (header global + col esquerda + centro + col direita).
 * Reutilizado por /feed e pela página de post (/feed/post/[id]) para que a
 * coluna central seja "substituída" mantendo as laterais. Responsividade
 * (esconder colunas) vive em styles/prototype.css via .grid-feed-3.
 */
export function FeedShell({ left, right, children }: Props) {
  return (
    <div className="page fade-in">
      <div className="grid-feed-3">
        {left}
        <main className="col" style={{ gap: 14 }}>
          {children}
        </main>
        {right}
      </div>
    </div>
  )
}
