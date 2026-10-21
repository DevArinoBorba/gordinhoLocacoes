'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Banner } from '@/lib/queries';

interface HeroBannerSliderProps {
  banners: Banner[];
  defaultMascot: string;
}

export function HeroBannerSlider({ banners, defaultMascot }: HeroBannerSliderProps) {
  const [current, setCurrent] = useState(0);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [total, nextSlide]);

  if (total === 0) {
    return (
      <section className="store-hero">
        <div>
          <p className="store-eyebrow">FERRAMENTAS, SOM E ACESSÓRIOS PARA LOCAÇÃO</p>
          <h1>
            SUA OBRA.<br />
            SEU EVENTO.<br />
            <em>A GENTE EQUIPA!</em>
          </h1>
          <p>
            Escolha o equipamento, confira o período disponível e solicite sua reserva. Mais praticidade para tirar seus planos do papel.
          </p>
          <Link className="store-button" href="#equipamentos">
            VER EQUIPAMENTOS & PREÇOS <span>↗</span>
          </Link>
          <div className="hero-benefits">
            <span>✓ Preço por diária</span>
            <span>✓ Consulta de disponibilidade</span>
            <span>✓ Confirmação com a equipe</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit" />
          <Image
            className="hero-mascot"
            src={defaultMascot}
            alt="Mascote Gordinho"
            width={360}
            height={360}
            unoptimized
            priority
          />
          <span className="hero-sticker">
            SEU PROJETO<br />
            AQUI GANHA<br />
            <strong>FORÇA!</strong>
          </span>
        </div>
      </section>
    );
  }

  const activeBanner = banners[current];

  return (
    <div
      className="hero-slider-wrap"
      role="region"
      aria-label="Destaques e Novidades"
    >
      <section className="store-hero hero-slide-active" key={activeBanner.id}>
        <div className="hero-content-col">
          {activeBanner.eyebrow && (
            <p className="store-eyebrow">{activeBanner.eyebrow}</p>
          )}
          <h1>{formatTitle(activeBanner.title)}</h1>
          {activeBanner.subtitle && (
            <p>{activeBanner.subtitle}</p>
          )}
          <Link className="store-button" href={activeBanner.link_url || '#equipamentos'}>
            {activeBanner.link_text || 'VER EQUIPAMENTOS & PREÇOS'} <span>↗</span>
          </Link>
          <div className="hero-benefits">
            <span>✓ Preço por diária</span>
            <span>✓ Consulta de disponibilidade</span>
            <span>✓ Confirmação com a equipe</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-orbit" />
          {activeBanner.image_filename ? (
            <div className="hero-product-frame">
              <Image
                className="hero-product-img"
                src={`/loja/imagens/${activeBanner.image_filename}`}
                alt={activeBanner.title}
                width={460}
                height={380}
                unoptimized
                priority
              />
            </div>
          ) : (
            <Image
              className="hero-mascot"
              src={defaultMascot}
              alt="Mascote Gordinho"
              width={360}
              height={360}
              unoptimized
              priority
            />
          )}

          {activeBanner.badge_text && (
            <span className="hero-sticker">
              {formatBadge(activeBanner.badge_text)}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function formatTitle(title: string) {
  // If the title contains newlines, preserve them
  if (title.includes('\n')) {
    const lines = title.split('\n');
    return (
      <>
        {lines.map((line, idx) => (
          <span key={idx} style={{ display: 'block' }}>
            {idx === lines.length - 1 ? <em>{line}</em> : line}
          </span>
        ))}
      </>
    );
  }
  // If title has multiple words, highlight the last word(s)
  const words = title.split(' ');
  if (words.length > 3) {
    const main = words.slice(0, -2).join(' ');
    const highlight = words.slice(-2).join(' ');
    return (
      <>
        {main} <em>{highlight}</em>
      </>
    );
  }
  return title;
}

function formatBadge(text: string) {
  const parts = text.split('\n');
  if (parts.length > 1) {
    return (
      <>
        {parts.slice(0, -1).map((p, idx) => (
          <span key={idx} style={{ display: 'block' }}>
            {p}
          </span>
        ))}
        <strong>{parts[parts.length - 1]}</strong>
      </>
    );
  }
  return <strong>{text}</strong>;
}
