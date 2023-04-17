<a name="readme-top"></a>


[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<br />
<div align="center">
  <a href="https://github.com/zennvote/zennbot-server-2">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">젠프로봇</h3>

  <p align="center">
    젠프로덕션의 챗봇 어플리케이션을 위한 API Server입니다.
    <br />
    <a href="https://github.com/zennvote/zennbot-server-2/issues">Report Bug</a>
    ·
    <a href="https://github.com/zennvote/zennbot-server-2/issues">Request Feature</a>
  </p>
</div>


## 프로젝트 소개

[![Zennbot Screen Shot][product-screenshot]](https://zennbot.net/)
젠프로덕션 음악방송에서 사용되는 챗봇 및 대시보드 어플리케이션입니다. 

구글 시트로 관리되던 사용자 포인트 정보를 이용하여 신청곡 신청 및 포인트 차감, 지급 등을 자동화합니다.



## 사용 기술

[![TypeScript][TypeScript]][TypeScript-url] [![NestJs][NestJs]][NestJs-url] [![Prisma][Prisma]][Prisma-url]

[![avajs][avajs]][avajs-url] [![Jest][Jest]][Jest-url]

[![PostgreSQL][PostgreSQL]][PostgreSQL-url] [![Google Sheets][Google Sheets]][Google Sheets-url]

[![GithubActions][GithubActions]][GithubActions-url]

[![Docker][Docker]][Docker-url]


## 프로젝트 구성
현재 기존 아키텍쳐와 신규 아키텍쳐가 동시에 존재합니다. 모든 레거시 아키텍쳐를 신규 아키텍쳐로 점진적 이관하려고 합니다.

신규 아키텍쳐의 경우  실행 흐름을 `domain` | `application` | `infrastructure` 의 세가지 레이어로 구분했습니다.
이 외에 본 프로젝트의 유즈케이스와는 크게 관련 없는 코드들은 `libs` 및 `utils`에서 관리합니다.

```
src
├── app
│   기존 아키텍쳐로 된 코드를 담고 있습니다.
│
├── libs
│   NestJS의 모듈로서 제공 가능한 내부 라이브러리를 담고 있습니다.
├── util
│   General하게 사용한 유틸 함수 등을 담고 있습니다.
│
├── domain
│   ├── songs
│   │   ├── songs.entity.ts
│   │   │   해당 도메인 모듈에 필요한 엔티티 정의를 담고 있습니다.
│   │   ├── songs.service.ts
│   │   │   해당 도메인 모듈의 도메인 서비스를 담고 있습니다.
│   │   └── songs.repository.ts
│   │       해당 도메인 모듈의 영속화를 위한 레포지토리 인터페이스를 담고 있습니다.
│   ├── viewers
│   └── ...
│
├── application
│   ├──  songs
│   │    ├── songs.application.ts
│   │    │   해당 어플리케이션의 유즈케이스를 담는 어플리케이션 서비스를 담고 있습니다.
│   │    └── songs.application.spec.ts
│   │        해당 어플리케이션의 각 유즈케이스에 대한 테스트 코드를 담고 있습니다.
│   ├── viewers
│   └── ...
│
└── infrastructure
    ├── persistence
    │   ├── songs
    │   │   ├── songs.repository.ts
    │   │   │   도메인 레이어에 정의된 레포지토리 인터페이스의 구현체를 담고 있습니다.
    │   │   └── songs.mock.ts
    │   │       도메인 레이어의 레포지토리 인터페이스를 테스트를 위한 mock 데이터를 반환하도록 구현한 구현체를 담고 있습니다.
    │   ├── viewers
    │   └── ...
    │
    └── presentation
        ├── http
        │   ├── songs
        │   │   └── songs.controller.ts
        │   │       HTTP API를 서빙하기 위한 컨트롤러입니다.
        │   ├── viewers
        │   └── ...
        └── tmi
            ├── songs
            │   └── songs.gateway.ts
            │       트위치 채팅을 서빙하기 위한 컨트롤러입니다.
            ├── viewers
            └── ...
```

## 에러 처리
기본적으로 기능으로서 명시된 비즈니스 에러는 `BusinessError` 객체로 처리됩니다.  
이 객체는 throw되는 객체가 아닌 하나의 값으로 처리되며 원래 Usecase의 결과와 Union되어 반환됩니다.  
즉. BusinessError가 반환될 수 있는 함수의 결과를 읽기 위해선 해당 결과가 에러가 아님을 증명해야 합니다.

이 패턴은 모든 예외 사항이 아닌 비즈니스 규칙으로 정의된 예외에 대해서만 적용합니다.  
즉, 데이터베이스 오류 등의 비정상 예외 상황은 기존처럼 에러를 throw하는 방법으로 처리합니다.

해당 객체를 유연하게 처리하기 위해 다음 두가지 유틸 함수를 제공합니다.
- `isBusinessError(error)`  
  해당 값이 `BusinessError`인지 확인합니다.
- `mapError(error, map)`  
  error의 값에 따라 map에 미리 정의된 결과를 반환합니다. 만약 map에 정의된 결과가 Error일 경우 반환하지 않고 throw합니다.  
  map의 타입은 error가 내포하는 모든 BusinessError의 에러를 key로 담을 수 있도록 강제되어 있습니다.

```typescript
function getSong(username: string): Song | BusinessError<'song-not-found' | 'user-not-found'>;

const sample = () => {
  const song = getSong('shift'); // The type is "Song | BusinessError<'song-not-found'>";
  song.title // TYPE ERROR! song can be BusinessError

  if (isBusinessError(song)) return errorMap(song, {
    'song-not-found': new NotFoundException(song.error), // It will throw Error
    'user-not-found': '유저를 찾을 수 없습니다!', // It will return string value
  });

  return song.title; // now it doesn't cause error. (song's type is Song)
}
```


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/zennvote/zennbot-server-2.svg?style=for-the-badge
[contributors-url]: https://github.com/zennvote/zennbot-server-2/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/zennvote/zennbot-server-2.svg?style=for-the-badge
[forks-url]: https://github.com/zennvote/zennbot-server-2/network/members
[stars-shield]: https://img.shields.io/github/stars/zennvote/zennbot-server-2.svg?style=for-the-badge
[stars-url]: https://github.com/zennvote/zennbot-server-2/stargazers
[issues-shield]: https://img.shields.io/github/issues/zennvote/zennbot-server-2.svg?style=for-the-badge
[issues-url]: https://github.com/zennvote/zennbot-server-2/issues

[product-screenshot]: images/screenshot-zennbot.png

[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white
[TypeScript-url]: https://nestjs.com/
[NestJs]: https://img.shields.io/badge/NestJs-000000?style=for-the-badge&logo=NestJS&logoColor=E0234E
[NestJs-url]: https://nestjs.com/
[Prisma]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=Prisma&logoColor=white
[Prisma-url]: https://nestjs.com/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white
[PostgreSQL-url]: https://nestjs.com/
[Google Sheets]: https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=Google%20Sheets&logoColor=white
[Google Sheets-url]: https://nestjs.com/
[GithubActions]: https://img.shields.io/badge/Github%20Actions-181717?style=for-the-badge&logo=Github%20Actions&logoColor=2088FF
[GithubActions-url]: https://nestjs.com/
[avajs]: https://img.shields.io/badge/avajs-4B4B77?style=for-the-badge&logo=avajs&logoColor=white
[avajs-url]: https://nestjs.com/
[Jest]: https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=Jest&logoColor=white
[Jest-url]: https://nestjs.com/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white
[Docker-url]: https://nestjs.com/
