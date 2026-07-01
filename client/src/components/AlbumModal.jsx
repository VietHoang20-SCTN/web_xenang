import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { assetUrl } from '../api'

export default function AlbumModal({ album, albumIndex, setAlbumIndex, selectedProduct, onClose, siteSettings, onQuote }) {
  return (
    <div className="album-modal" onClick={onClose}>
      <div className={selectedProduct ? "album-viewer product-detail-modal" : "album-viewer"} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn modal-close" onClick={onClose}><X /></button>
        <div>
          <h2>{album.product.name}</h2>
          {selectedProduct && <p>{album.product.summary}</p>}
        </div>
        <img className="album-main" src={assetUrl(album.images[albumIndex])} alt={album.product.name} />
        <div className="album-thumbs">
          {album.images.map((image, index) => (
            <button className={index === albumIndex ? "active" : ""} key={image} onClick={() => setAlbumIndex(index)}>
              <img src={assetUrl(image)} alt={`${album.product.name} ${index + 1}`} />
            </button>
          ))}
        </div>
        {selectedProduct && (
          <div className="product-detail-content">
            <h3>Thông số kỹ thuật</h3>
            <ul>{(selectedProduct.specs || []).map((spec) => <li key={spec}><CheckCircle2 size={16} />{spec}</li>)}</ul>
            <div className="hero-actions">
              <a className="primary-btn" href="#quote" onClick={() => onQuote(selectedProduct.id, `Tư vấn ${selectedProduct.name}`)}>Nhận báo giá</a>
              <a className="zalo-icon-btn small-zalo" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
