import { CacheModule, CACHE_MANAGER } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Cache } from "cache-manager";
import Song, { RequestType } from "./songs.entity";
import { SongsRepository } from "./songs.repository";

const RequestedSongsKey = 'songs:requested-songs';
const CooltimeSongsKey = 'songs:cooltime-songs';

describe('SongsRepository', () => {
  let repository: SongsRepository;
  let cache: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [SongsRepository],
    }).compile();

    repository = module.get<SongsRepository>(SongsRepository);
    cache = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(cache).toBeDefined();
  });

  describe('getRequestedSongs', () => {
    it('신청곡 목록을 반환해야 한다.', async () => {
      cache.set(RequestedSongsKey, `[
        {"title": "test song 1", "requestor": "viewer1", "requestorName": "시청자1", "requestType": "티켓"},
        {"title": "test song 2", "requestor": "viewer2", "requestorName": "시청자2", "requestType": "티켓"},
        {"title": "test song 3", "requestor": "viewer3", "requestorName": "시청자3", "requestType": "티켓"}
      ]`);

      const result = await repository.getRequestedSongs();

      result.forEach((result, index) => {
        expect(result).toHaveProperty('title', `test song ${index+1}`);
        expect(result).toHaveProperty('requestor', `viewer${index+1}`);
        expect(result).toHaveProperty('requestorName', `시청자${index+1}`);
        expect(result).toHaveProperty('requestType', '티켓');
        expect(result).toBeInstanceOf(Song);
      });
    });

    it('신청곡 초기값이 설정되지 않은 상황에서는 빈 배열을 반환해야 한다.', async () => {
      const result = await repository.getRequestedSongs();

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe('getCooltimeSongs', () => {
    it('쿨타임 목록을 반환해야 한다.', async () => {
      cache.set(CooltimeSongsKey, `[
        {"title": "test song 1", "requestor": "viewer1", "requestorName": "시청자1", "requestType": "티켓"},
        {"title": "test song 2", "requestor": "viewer2", "requestorName": "시청자2", "requestType": "티켓"},
        {"title": "test song 3", "requestor": "viewer3", "requestorName": "시청자3", "requestType": "티켓"}
      ]`);

      const result = await repository.getCooltimeSongs();

      result.forEach((result, index) => {
        expect(result.title).toBe(`test song ${index+1}`);
        expect(result.requestor).toBe(`viewer${index+1}`);
        expect(result.requestorName).toBe(`시청자${index+1}`);
        expect(result.requestType).toBe('티켓');
        expect(result).toBeInstanceOf(Song);
      });
    });

    it('쿨타임 초기값이 설정되지 않은 상황에서는 빈 배열을 반환해야 한다.', async () => {
      const result = await repository.getCooltimeSongs();

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe('setRequestedSongs', () => {
    it('신청곡 목록을 json 형태로 저장해야 한다.', async () => {
      const songs = [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
      ];
      
      const result = await repository.setRequestedSongs(songs);
      const cached = await cache.get(RequestedSongsKey);

      expect(result).toMatchObject(songs);
      expect(cached).toBe('[{"title":"test song 1","requestor":"viewer1","requestorName":"시청자1","requestType":"티켓"},{"title":"test song 2","requestor":"viewer2","requestorName":"시청자2","requestType":"티켓"}]')
    });
  });

  describe('setCooltimeSongs', () => {
    it('신청곡 목록을 json 형태로 저장해야 한다.', async () => {
      const songs = [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
      ];
      
      const result = await repository.setCooltimeSongs(songs);
      const cached = await cache.get(CooltimeSongsKey);

      expect(result).toMatchObject(songs);
      expect(cached).toBe('[{"title":"test song 1","requestor":"viewer1","requestorName":"시청자1","requestType":"티켓"},{"title":"test song 2","requestor":"viewer2","requestorName":"시청자2","requestType":"티켓"}]')
    });
  });
});
