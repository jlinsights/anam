'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import type { Artist } from '@/lib/types'

interface EnhancedArtistSectionProps {
  artist?: Artist
}

export function EnhancedArtistSection({ artist }: EnhancedArtistSectionProps) {
  const [activeTab, setActiveTab] = useState<'bio' | 'career' | 'philosophy'>('bio')
  
  // Use provided artist data or fallback
  const artistData = artist || {
    id: 'anam',
    name: '아남 배옥영',
    bio: '전통 서예의 깊이와 현대적 감각을 조화시키며, 한국 미학의 정수를 현대적 언어로 재해석하는 작업을 하고 있습니다.',
    birthYear: 1955,
    exhibitions: [],
    awards: [],
    education: [],
  }

  // Tab content components
  const TabContent = {
    bio: (
      <motion.div
        key="bio"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Biography */}
        <div>
          <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">작가 소개</h4>
          <p className="font-display text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {artistData.bio}
          </p>
        </div>

        {/* Artist Statement */}
        {artistData.statement && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border-l-4 border-yellow-600">
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-3">작가의 말</h4>
            <p className="font-display text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{artistData.statement}"
            </p>
          </div>
        )}

        {/* Personal Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artistData.birthYear && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="font-display text-gray-600 dark:text-gray-400 text-sm">출생년도</span>
              <p className="font-display text-gray-900 dark:text-white font-medium">{artistData.birthYear}년</p>
            </div>
          )}
          {artistData.birthPlace && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="font-display text-gray-600 dark:text-gray-400 text-sm">출생지</span>
              <p className="font-display text-gray-900 dark:text-white font-medium">{artistData.birthPlace}</p>
            </div>
          )}
          {artistData.currentLocation && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="font-display text-gray-600 dark:text-gray-400 text-sm">현 거주지</span>
              <p className="font-display text-gray-900 dark:text-white font-medium">{artistData.currentLocation}</p>
            </div>
          )}
          {artistData.specialties && artistData.specialties.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="font-display text-gray-600 dark:text-gray-400 text-sm">전문 분야</span>
              <p className="font-display text-gray-900 dark:text-white font-medium">
                {artistData.specialties.join(', ')}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    ),
    
    career: (
      <motion.div
        key="career"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Education */}
        {artistData.education && artistData.education.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">학력</h4>
            <ul className="space-y-2">
              {artistData.education.map((edu, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span className="font-display text-gray-700 dark:text-gray-300">{edu}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exhibitions */}
        {artistData.exhibitions && artistData.exhibitions.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">전시 이력</h4>
            <ul className="space-y-3">
              {artistData.exhibitions.map((exhibition, index) => (
                <li key={index} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-1">
                  <span className="font-display text-gray-700 dark:text-gray-300">{exhibition}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Awards */}
        {artistData.awards && artistData.awards.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">수상 경력</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artistData.awards.map((award, index) => (
                <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <span className="font-display text-gray-900 dark:text-white flex items-center">
                    <span className="text-yellow-600 mr-2">🏆</span>
                    {award}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        {artistData.collections && artistData.collections.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">작품 소장처</h4>
            <ul className="space-y-2">
              {artistData.collections.map((collection, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-600 mr-2">▪</span>
                  <span className="font-display text-gray-700 dark:text-gray-300">{collection}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Publications */}
        {artistData.publications && artistData.publications.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">출판물</h4>
            <ul className="space-y-2">
              {artistData.publications.map((publication, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-600 mr-2">📚</span>
                  <span className="font-display text-gray-700 dark:text-gray-300">{publication}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    ),
    
    philosophy: (
      <motion.div
        key="philosophy"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Philosophy */}
        {artistData.philosophy && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">작업 철학</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="font-display text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {artistData.philosophy}
              </p>
            </div>
          </div>
        )}

        {/* Influences */}
        {artistData.influences && artistData.influences.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">예술적 영향</h4>
            <div className="flex flex-wrap gap-3">
              {artistData.influences.map((influence, index) => (
                <span key={index} className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-gray-900 dark:text-white rounded-full font-display text-sm">
                  {influence}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Techniques */}
        {artistData.techniques && artistData.techniques.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">주요 기법</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artistData.techniques.map((technique, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                  <span className="font-display text-gray-700 dark:text-gray-300">{technique}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials */}
        {artistData.materials && artistData.materials.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">사용 재료</h4>
            <div className="flex flex-wrap gap-3">
              {artistData.materials.map((material, index) => (
                <span key={index} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-display text-sm border border-gray-200 dark:border-gray-700">
                  {material}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Teaching Experience */}
        {artistData.teachingExperience && artistData.teachingExperience.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-4">교육 경력</h4>
            <ul className="space-y-2">
              {artistData.teachingExperience.map((experience, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-600 mr-2">👥</span>
                  <span className="font-display text-gray-700 dark:text-gray-300">{experience}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Section header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="font-calligraphy font-bold text-gray-900 dark:text-white text-3xl md:text-4xl mb-4">
          작가 소개
        </h2>
        <p className="font-display text-gray-600 dark:text-gray-400 text-lg">
          Artist Profile • 書藝家
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-24 h-1 bg-yellow-600"></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Artist Profile Card */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="sticky top-24">
            {/* Profile Image */}
            <div className="relative bg-amber-50 dark:bg-amber-900 rounded-lg overflow-hidden shadow-lg mb-6">
              {artistData.profileImageUrl ? (
                <Image
                  src={artistData.profileImageUrl}
                  alt={artistData.name}
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 border-4 border-gray-300 dark:border-gray-600 rounded-full mb-4 mx-auto flex items-center justify-center">
                      <span className="font-calligraphy text-gray-400 dark:text-gray-500 text-4xl">芽南</span>
                    </div>
                    <span className="font-display text-gray-500 dark:text-gray-400 text-sm">작가 프로필</span>
                  </div>
                </div>
              )}
            </div>

            {/* Artist Name & Basic Info */}
            <div className="text-center mb-6">
              <h3 className="font-calligraphy font-bold text-gray-900 dark:text-white text-2xl mb-2">
                {artistData.name}
              </h3>
              <p className="font-display text-yellow-600 font-medium mb-2">
                ANAM Bae Ok Young
              </p>
              {artistData.birthYear && (
                <p className="font-display text-gray-600 dark:text-gray-400">
                  {artistData.birthYear}년생
                </p>
              )}
            </div>

            {/* Contact & Social Links */}
            <div className="space-y-3">
              {artistData.email && (
                <a href={`mailto:${artistData.email}`} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors">
                  <span className="mr-2">📧</span>
                  <span className="font-display text-sm">{artistData.email}</span>
                </a>
              )}
              {artistData.website && (
                <a href={artistData.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors">
                  <span className="mr-2">🌐</span>
                  <span className="font-display text-sm">웹사이트</span>
                </a>
              )}
              {artistData.socialLinks?.instagram && (
                <a href={`https://instagram.com/${artistData.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors">
                  <span className="mr-2">📷</span>
                  <span className="font-display text-sm">@{artistData.socialLinks.instagram}</span>
                </a>
              )}
            </div>

            {/* Memberships */}
            {artistData.memberships && artistData.memberships.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-display font-semibold text-gray-900 dark:text-white text-sm mb-3">소속 단체</h4>
                <ul className="space-y-1">
                  {artistData.memberships.map((membership, index) => (
                    <li key={index} className="font-display text-gray-600 dark:text-gray-400 text-sm">
                      • {membership}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Artist Content Tabs */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('bio')}
              className={`pb-4 px-2 font-display font-medium transition-colors relative ${
                activeTab === 'bio' 
                  ? 'text-yellow-600' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              작가 소개
              {activeTab === 'bio' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"
                  layoutId="tabIndicator"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`pb-4 px-2 font-display font-medium transition-colors relative ${
                activeTab === 'career' 
                  ? 'text-yellow-600' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              경력 사항
              {activeTab === 'career' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"
                  layoutId="tabIndicator"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('philosophy')}
              className={`pb-4 px-2 font-display font-medium transition-colors relative ${
                activeTab === 'philosophy' 
                  ? 'text-yellow-600' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              작품 세계
              {activeTab === 'philosophy' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"
                  layoutId="tabIndicator"
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {TabContent[activeTab]}
          </div>

          {/* Action Buttons */}
          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <a href="/gallery" className="
              inline-block text-center px-8 py-4
              bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-display font-bold
              hover:bg-yellow-600 hover:text-gray-900
              transition-all duration-300
              shadow-lg hover:shadow-xl
              transform hover:-translate-x-1 hover:-translate-y-1
              border-4 border-gray-900 dark:border-gray-100 hover:border-yellow-600
            ">
              작품 갤러리 보기
            </a>
            
            <a href="/contact" className="
              inline-block text-center px-8 py-4
              bg-white dark:bg-gray-800 border-4 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white font-display font-bold
              hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900
              transition-all duration-300
              shadow-lg hover:shadow-xl
              transform hover:translate-x-1 hover:translate-y-1
            ">
              작가에게 연락하기
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}