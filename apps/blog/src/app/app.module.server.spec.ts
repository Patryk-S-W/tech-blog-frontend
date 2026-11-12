import { PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideServerRendering } from '@angular/platform-server';
import { API_URL } from '@blog/shared/util';
import { provideBlogApplication } from './blog.providers';
import { provideBlogServer } from './blog.server.providers';
import { SERVER_API_URL } from './server-api.config';

describe('server application providers', () => {
  it('uses the server API origin without transferring private request metadata or responses', () => {
    const privateOrigin = 'http://127.0.0.1:18080';
    const assetOrigin = 'http://127.0.0.1:18081';
    TestBed.configureTestingModule({
      providers: [
        provideServerRendering(),
        ...provideBlogApplication(),
        ...provideBlogServer(),
        provideHttpClientTesting(),
        { provide: SERVER_API_URL, useValue: privateOrigin },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    expect(TestBed.inject(API_URL)).toBe(privateOrigin);
    const client = TestBed.inject(HttpClient);
    const http = TestBed.inject(HttpTestingController);
    for (const path of [
      '/api/v1/blog/announcements/7',
      '/api/v1/blog/announcements',
      '/api/v1/blog/projects',
      '/api/v1/future',
    ]) {
      const received = jest.fn();
      client.get(`${privateOrigin}${path}`, { transferCache: true }).subscribe(received);
      http.expectOne(`${privateOrigin}${path}`).flush({ marker: 'private-response-marker' });
      expect(received).toHaveBeenCalledWith({ marker: 'private-response-marker' });
    }

    const receivedAsset = jest.fn();
    client.get(`${assetOrigin}/assets/i18n/en.json`).subscribe(receivedAsset);
    http.expectOne(`${assetOrigin}/assets/i18n/en.json`).flush({ marker: 'public-cache-control' });
    expect(receivedAsset).toHaveBeenCalledWith({ marker: 'public-cache-control' });

    const serialized = TestBed.inject(TransferState).toJson();
    expect(serialized).toContain('public-cache-control');
    expect(serialized).not.toContain(privateOrigin);
    expect(serialized).not.toContain('/api/v1/');
    expect(serialized).not.toContain('private-response-marker');
    http.verify();
  });
});
