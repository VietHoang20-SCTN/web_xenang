import React from 'react'
import { ArrowRight, Menu, Phone, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import './hero-demo.css'

export default function HeroDemo() {
  return <main className="hero-demo">
    <header className="hero-demo-nav">
      <Link className="hero-demo-brand" to="/" aria-label="Xe Nâng Bắc Ninh"><span><Zap size={18}/></span><strong>Xe Nâng<br/>Bắc Ninh</strong></Link>
      <nav aria-label="Điều hướng demo"><a href="#demo-home">Trang chủ</a><a href="#demo-about">Giới thiệu</a><a href="#demo-products">Sản phẩm</a><a href="#demo-services">Dịch vụ</a><a href="#demo-contact">Liên hệ</a><a href="#demo-blog">Blog</a></nav>
      <a className="hero-demo-call" href="tel:0900000000"><Phone size={15}/> 0900 000 000 <ArrowRight size={14}/></a>
      <button className="hero-demo-menu" type="button" aria-label="Mở menu"><Menu/></button>
    </header>
    <section id="demo-home" className="hero-demo-stage">
      <div className="hero-demo-grid" aria-hidden="true" />
      <div className="hero-demo-orbit hero-demo-orbit-a" aria-hidden="true"/><div className="hero-demo-orbit hero-demo-orbit-b" aria-hidden="true"/>
      <div className="hero-demo-line-art line-art-left" aria-hidden="true">
        <svg viewBox="0 0 240 180"><path d="M18 143h199M43 128h90V76H77L58 96v32m75 0h31V38h9v90m0-7h48v8h-48M78 76V52h43l12 24M68 128a20 20 0 1 1-40 0 20 20 0 0 1 40 0Zm94 0a18 18 0 1 1-36 0 18 18 0 0 1 36 0ZM83 58v18m-25 20h75"/></svg>
      </div>
      <div className="hero-demo-line-art line-art-right" aria-hidden="true">
        <svg viewBox="0 0 240 180"><path d="M20 144h200M49 128h88V80H79L61 99v29m76 0h29V42h9v86m0-9h45v9h-45M79 80V56h40l18 24M72 128a20 20 0 1 1-40 0 20 20 0 0 1 40 0Zm96 0a18 18 0 1 1-36 0 18 18 0 0 1 36 0ZM62 99h75m-55-19V56"/></svg>
      </div>
      <div className="hero-demo-line-art line-art-top" aria-hidden="true">
        <svg viewBox="0 0 240 180"><path d="M22 144h196M48 129h89V79H78L59 98v31m78 0h30V40h9v89m0-9h43v9h-43M78 79V55h42l17 24M71 129a20 20 0 1 1-40 0 20 20 0 0 1 40 0Zm97 0a18 18 0 1 1-36 0 18 18 0 0 1 36 0Z"/></svg>
      </div>
      <div className="hero-demo-warehouse" aria-hidden="true">
        <svg viewBox="0 0 1440 620" preserveAspectRatio="none"><path d="M0 470h260v-190h180v190h560v-230h190v230h250M40 430h180M40 380h180M40 330h180M80 280v190m70-190v190M290 430h120M290 380h120M290 330h120M1030 420h130M1030 360h130M1030 300h130M1070 240v230m55-230v230M220 500h100m800 0h120M470 470c100-90 170-90 270 0s170 90 270 0"/></svg>
      </div>
      <div className="hero-demo-copy">
        <span className="hero-demo-kicker">GIẢI PHÁP NÂNG HẠ · BẮC NINH</span>
        <h1>Giải pháp xe nâng<br/>cho vận hành kho<br/><em>chuyên nghiệp</em></h1>
        <p>Bán, cho thuê và bảo trì xe nâng cùng thiết bị kho. Đồng hành cùng doanh nghiệp từ lựa chọn thiết bị đến vận hành thực tế.</p>
        <div className="hero-demo-actions"><a href="#demo-quote">Nhận báo giá <ArrowRight size={18}/></a><button type="button">Chat Zalo</button></div>
      </div>
      <div className="hero-demo-marquee" aria-label="Các thương hiệu xe nâng phục vụ">
        <div className="hero-demo-marquee-track">
          <span>TOYOTA</span><i/> <span>KOMATSU</span><i/> <span>MITSUBISHI</span><i/> <span>HELI</span><i/> <span>HANGCHA</span><i/> <span>TCM</span><i/>
          <span aria-hidden="true">TOYOTA</span><i/> <span aria-hidden="true">KOMATSU</span><i/> <span aria-hidden="true">MITSUBISHI</span><i/> <span aria-hidden="true">HELI</span><i/> <span aria-hidden="true">HANGCHA</span><i/> <span aria-hidden="true">TCM</span><i/>
        </div>
      </div>
      <div className="hero-demo-metrics" aria-label="Năng lực dịch vụ"><div><strong>24H</strong><span>Phản hồi yêu cầu</span></div><div><strong>Miền Bắc</strong><span>Khu vực phục vụ</span></div><div><strong>Trọn gói</strong><span>Bán · Thuê · Bảo trì</span></div></div>
    </section>
  </main>
}
