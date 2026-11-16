import { EnvironmentInjector, PLATFORM_ID, TransferState, createEnvironmentInjector } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideServerRendering } from '@angular/platform-server';
import { API_URL, INITIAL_UI_LANGUAGE, UiPreferencesService } from '@blog/shared/util';
import { provideBlogApplication } from './blog.providers';
import { provideBlogServer } from './blog.server.providers';
import { SERVER_API_URL } from './server-api.config';
import { provideRouter } from '@angular/router';
import { TranslocoRootModule } from './transloco-root.module';

describe('server application providers', () => {
  it('forwards separate per-render parent languages into server application roots', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const parent = TestBed.inject(EnvironmentInjector);
    const languageProviders = provideBlogServer().filter((provider) =>
      typeof provider === 'object' && provider !== null && 'provide' in provider && provider.provide === INITIAL_UI_LANGUAGE);
    const renders = (['pl', 'en'] as const).map((language) => {
      const platform = createEnvironmentInjector([{ provide: INITIAL_UI_LANGUAGE, useValue: language }], parent);
      const document = TestBed.inject(DOCUMENT).implementation.createHTMLDocument();
      const application = createEnvironmentInjector([
        ...languageProviders,
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: DOCUMENT, useValue: document },
        UiPreferencesService,
      ], platform);
      return { platform, application, document, language };
    });
    try {
      const preferences = renders.map((render) => render.application.get(UiPreferencesService));
      renders.forEach((render, index) => {
        expect(render.application.get(INITIAL_UI_LANGUAGE)).toBe(render.language);
        expect(preferences[index].language()).toBe(render.language);
        expect(render.document.documentElement.lang).toBe(render.language);
      });
      expect(preferences[0].language()).toBe('pl');
      expect(preferences[1].language()).toBe('en');
    } finally {
      renders.forEach((render) => { render.application.destroy(); render.platform.destroy(); });
    }
  });

  it('uses the server API origin without transferring private request metadata or responses', () => {
    const privateOrigin = 'http://127.0.0.1:18080';
    const assetOrigin = 'http://127.0.0.1:18081';
    TestBed.configureTestingModule({
      imports: [TranslocoRootModule],
      providers: [
        provideRouter([]),
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
