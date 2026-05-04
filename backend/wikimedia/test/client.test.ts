import { describe, it, expect, vi } from 'vitest';
import { searchCommons, findWikipediaPageImage } from '../client';

// Mock-svar från Wikimedia API. Trimmade till de fält vår klient läser.
function mockSearchResponse(titles: string[]): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      query: { search: titles.map((t) => ({ title: t })) },
    }),
  } as unknown as Response;
}

function mockImageInfoResponse(
  pages: Array<{
    title: string;
    url: string;
    thumburl?: string;
    descriptionurl: string;
    width: number;
    height: number;
    license?: string;
    artist?: string;
  }>,
): Response {
  const pagesObj: Record<string, unknown> = {};
  pages.forEach((p, i) => {
    pagesObj[String(-1 - i)] = {
      title: p.title,
      imageinfo: [
        {
          url: p.url,
          thumburl: p.thumburl,
          descriptionurl: p.descriptionurl,
          width: p.width,
          height: p.height,
          extmetadata: {
            ...(p.license ? { LicenseShortName: { value: p.license } } : {}),
            ...(p.artist ? { Artist: { value: p.artist } } : {}),
          },
        },
      ],
    };
  });
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ query: { pages: pagesObj } }),
  } as unknown as Response;
}

describe('searchCommons', () => {
  it('returns parsed results in search order', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        mockSearchResponse(['File:Astrid Lindgren 1960.jpg', 'File:Astrid 1980.jpg']),
      )
      .mockResolvedValueOnce(
        mockImageInfoResponse([
          {
            title: 'File:Astrid Lindgren 1960.jpg',
            url: 'https://upload.wikimedia.org/.../1960.jpg',
            thumburl: 'https://upload.wikimedia.org/.../1960_thumb.jpg',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:Astrid_Lindgren_1960.jpg',
            width: 1200,
            height: 1600,
            license: 'CC BY-SA 4.0',
            artist: '<a href="...">Photographer Name</a>',
          },
          {
            title: 'File:Astrid 1980.jpg',
            url: 'https://upload.wikimedia.org/.../1980.jpg',
            thumburl: 'https://upload.wikimedia.org/.../1980_thumb.jpg',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:Astrid_1980.jpg',
            width: 800,
            height: 1000,
            license: 'Public domain',
          },
        ]),
      );

    const results = await searchCommons('Astrid Lindgren', { fetchFn });

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('File:Astrid Lindgren 1960.jpg');
    expect(results[0].license).toBe('CC BY-SA 4.0');
    expect(results[0].artist).toBe('Photographer Name');
    expect(results[0].width).toBe(1200);
    expect(results[1].license).toBe('Public domain');
    expect(results[1].artist).toBeNull();
  });

  it('returns empty array when search has no results', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mockSearchResponse([]));

    const results = await searchCommons('NonexistentObscureTerm12345', { fetchFn });
    expect(results).toEqual([]);
    // Imageinfo-anropet ska inte ha gjorts
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('throws when search HTTP fails', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as unknown as Response);

    await expect(searchCommons('anything', { fetchFn })).rejects.toThrow(/500/);
  });

  it('strips HTML tags from artist field', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mockSearchResponse(['File:Test.jpg']))
      .mockResolvedValueOnce(
        mockImageInfoResponse([
          {
            title: 'File:Test.jpg',
            url: 'https://example/test.jpg',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
            width: 100,
            height: 100,
            artist:
              '<a href="https://example/user" title="User:Photographer">Jane Doe</a>',
          },
        ]),
      );

    const results = await searchCommons('test', { fetchFn });
    expect(results[0].artist).toBe('Jane Doe');
  });

  it('builds API URLs with the right parameters', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mockSearchResponse([]));

    await searchCommons('Olof Palme', { limit: 9, thumbnailWidth: 600, fetchFn });

    const url = (fetchFn.mock.calls[0][0] as string);
    expect(url).toContain('action=query');
    expect(url).toContain('list=search');
    expect(url).toContain('srnamespace=6');
    // URLSearchParams encodar mellanslag som '+', inte '%20'
    expect(url).toContain('srsearch=Olof+Palme');
    expect(url).toContain('srlimit=9');
  });

  it('source field is set to commons-search', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mockSearchResponse(['File:Test.jpg']))
      .mockResolvedValueOnce(
        mockImageInfoResponse([
          {
            title: 'File:Test.jpg',
            url: 'https://example/test.jpg',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
            width: 100,
            height: 100,
          },
        ]),
      );

    const results = await searchCommons('test', { fetchFn });
    expect(results[0].source).toBe('commons-search');
  });
});

function mockWikipediaPagesResponse(
  page: {
    title: string;
    fullurl: string;
    pageimage?: string;
    originalUrl?: string;
    thumbUrl?: string;
    width?: number;
    height?: number;
  } | null,
): Response {
  if (!page) {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ query: {} }),
    } as unknown as Response;
  }
  const obj: Record<string, unknown> = {
    pageid: 1,
    title: page.title,
    fullurl: page.fullurl,
  };
  if (page.pageimage) {
    obj.pageimage = page.pageimage;
    obj.original = {
      source: page.originalUrl,
      width: page.width,
      height: page.height,
    };
    obj.thumbnail = {
      source: page.thumbUrl,
      width: 400,
      height: 500,
    };
  }
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ query: { pages: { '1': obj } } }),
  } as unknown as Response;
}

describe('findWikipediaPageImage', () => {
  it('returns null when no article matches search term', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mockWikipediaPagesResponse(null));

    const result = await findWikipediaPageImage('NonexistentTerm12345', { fetchFn });
    expect(result).toBeNull();
  });

  it('returns null when article has no pageimage', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      mockWikipediaPagesResponse({
        title: 'Some Article',
        fullurl: 'https://en.wikipedia.org/wiki/Some_Article',
      }),
    );

    const result = await findWikipediaPageImage('Some Article', { fetchFn });
    expect(result).toBeNull();
  });

  it('returns full result with license from Commons when pageimage exists', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        mockWikipediaPagesResponse({
          title: 'Astrid Lindgren',
          fullurl: 'https://en.wikipedia.org/wiki/Astrid_Lindgren',
          pageimage: 'Astrid_Lindgren_1960.jpg',
          originalUrl: 'https://upload.wikimedia.org/.../full.jpg',
          thumbUrl: 'https://upload.wikimedia.org/.../400px.jpg',
          width: 1200,
          height: 1500,
        }),
      )
      .mockResolvedValueOnce(
        mockImageInfoResponse([
          {
            title: 'File:Astrid Lindgren 1960.jpg',
            url: 'https://upload.wikimedia.org/.../full.jpg',
            descriptionurl:
              'https://commons.wikimedia.org/wiki/File:Astrid_Lindgren_1960.jpg',
            width: 1200,
            height: 1500,
            license: 'CC BY-SA 4.0',
            artist: 'Photo Archive',
          },
        ]),
      );

    const result = await findWikipediaPageImage('Astrid Lindgren', { fetchFn });
    expect(result).not.toBeNull();
    expect(result?.source).toBe('wikipedia-en');
    expect(result?.title).toBe('File:Astrid Lindgren 1960.jpg');
    expect(result?.url).toBe('https://upload.wikimedia.org/.../full.jpg');
    expect(result?.license).toBe('CC BY-SA 4.0');
    expect(result?.artist).toBe('Photo Archive');
    expect(result?.descriptionUrl).toBe('https://en.wikipedia.org/wiki/Astrid_Lindgren');
  });

  it('returns result with null license when Commons license-lookup fails', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        mockWikipediaPagesResponse({
          title: 'Some Article',
          fullurl: 'https://en.wikipedia.org/wiki/Some_Article',
          pageimage: 'Some_Image.jpg',
          originalUrl: 'https://upload/full.jpg',
          thumbUrl: 'https://upload/thumb.jpg',
          width: 800,
          height: 600,
        }),
      )
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server error',
      } as unknown as Response);

    const result = await findWikipediaPageImage('Some Article', { fetchFn });
    expect(result).not.toBeNull();
    expect(result?.license).toBeNull();
    expect(result?.artist).toBeNull();
  });

  it('uses Swedish endpoint when lang=sv', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mockWikipediaPagesResponse(null));

    await findWikipediaPageImage('Astrid Lindgren', { lang: 'sv', fetchFn });

    const url = fetchFn.mock.calls[0][0] as string;
    expect(url.startsWith('https://sv.wikipedia.org/')).toBe(true);
  });

  it('source field reflects the chosen language', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        mockWikipediaPagesResponse({
          title: 'Test',
          fullurl: 'https://sv.wikipedia.org/wiki/Test',
          pageimage: 'Test.jpg',
          originalUrl: 'https://upload/full.jpg',
          thumbUrl: 'https://upload/thumb.jpg',
          width: 800,
          height: 600,
        }),
      )
      .mockResolvedValueOnce(
        mockImageInfoResponse([
          {
            title: 'File:Test.jpg',
            url: 'https://upload/full.jpg',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
            width: 800,
            height: 600,
          },
        ]),
      );

    const result = await findWikipediaPageImage('Test', { lang: 'sv', fetchFn });
    expect(result?.source).toBe('wikipedia-sv');
  });
});
