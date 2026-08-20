# Cloudflare RM Referral Site Design Guidelines

This document specifies the standard design system, component library, and layout guidelines for the **RM Referral Cloudflare Site (`cloudflare-site`)**.
All future pages (guides, area pages, topic articles, etc.) MUST strictly adhere to these specifications.

---

## 1. Design Principles

1. **Trust & Transparency**: Clear, honest, and accurate information on Rakuten Mobile plans and referral campaigns.
2. **Unified Design System**: Identical layout widths, typography, card structures, and CSS classes matching the language homepages (`/en/`, `/zh/`, `/ko/`, `/vi/`, `/pt/`).
3. **Mobile-First Responsiveness**: Flawless responsive behavior from mobile screens (320px+) to desktop (1180px/1116px).

---

## 2. Layout & Width Specifications

| Section Type | CSS Class / Element | Desktop Max Width | Padding / Margins |
|---|---|---|---|
| **Main Container** | `<main class="home-main">` | 100% (Padding: 0) | Full page main wrapper |
| **Breadcrumbs** | `<nav class="breadcrumb">` | **1116px** (`margin: 0 auto`) | `18px 32px` |
| **Hero Section** | `<section class="home-hero">` | **1180px** (`margin: auto`) | `92px 32px 105px` (Mobile: `44px 20px 64px`) |
| **Content Section** | `<section class="home-section">` | **1116px** (`margin: auto`) | `105px 32px` (Mobile: `70px 20px`) |
| **Surface Section** | `<section class="campaign-section">` | 100% (`var(--surface)`) | `100px max(32px, calc((100vw - 1052px) / 2))` |
| **Final CTA** | `<section class="final-cta home-final-cta">` | 100% (Gradient Red) | `88px 24px 105px` |

> [!CAUTION]
> **No Custom Content Widths**: Do not apply custom container widths like `max-width: 920px` or `width: 80%`. Always stick to the standard widths (1180px for hero, 1116px for content sections).

---

## 3. Approved Component Library

All pages should be constructed by combining the following standardized components:

1. **Hero Component**: `<section class="home-hero">` with `.home-hero-copy`, `.lead`, `.home-hero-actions`, and `.home-start-card`.
2. **Section Headings**: `<div class="home-section-heading">` with `.section-label`, `<h2>`, and description `<p>`.
3. **3-Column Feature Cards**: `<div class="essential-grid">` containing `<article>` elements.
4. **3-Column Pricing Display**: `<div class="cards-three">` containing `<article>` cards with `.pill` badges and price headers.
5. **2-Column Checklist & Notice**: `<div class="two-columns">` containing `<article class="note-card">`.
6. **4-Step Process**: `<ol class="campaign-steps">` containing `<li><b>num</b><div><h3>title</h3><p>desc</p></div></li>`.
7. **Final CTA Banner**: `<section class="final-cta home-final-cta">` with `.eyebrow`, `<h2>`, `<p>`, and `.button.light`.

---

## 4. Multi-language Rules

1. Support for language codes: `/en/`, `/zh/`, `/ko/`, `/vi/`, `/pt/`.
2. Every page must set valid `canonical` and `alternate hreflang` links matching available languages.
3. If a page is for non-Japanese audiences only, do NOT include `hreflang="ja"` or Japanese dropdown options.
