import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-launch-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      role="status"
      aria-busy="true"
      aria-label="Carregando lançamento"
      animate.enter="terraco-reveal"
      animate.leave="terraco-chip-leave"
      class="flex flex-col gap-3.5"
    >
      <div
        aria-hidden="true"
        class="terraco-skeleton aspect-[16/10] w-full rounded-[20px]"
      ></div>

      <div aria-hidden="true" class="space-y-2">
        <div class="terraco-skeleton h-3.5 w-32 rounded-sm"></div>
        <div class="terraco-skeleton h-6 w-44 rounded-sm"></div>
      </div>

      <div
        aria-hidden="true"
        class="grid grid-cols-2 gap-x-5 gap-y-2.5 border-t border-border-subtle pt-3"
      >
        <div class="space-y-1.5">
          <div class="terraco-skeleton h-3 w-20 rounded-sm"></div>
          <div class="terraco-skeleton h-4 w-24 rounded-sm"></div>
        </div>
        <div class="space-y-1.5">
          <div class="terraco-skeleton h-3 w-16 rounded-sm"></div>
          <div class="terraco-skeleton h-4 w-24 rounded-sm"></div>
        </div>
      </div>
    </article>
  `,
})
export class LaunchCardSkeletonComponent {}

@Component({
  selector: 'app-launch-detail-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      role="status"
      aria-busy="true"
      aria-label="Carregando lançamento"
      animate.enter="terraco-reveal"
      animate.leave="terraco-chip-leave"
      class="flex flex-1 flex-col justify-start bg-canvas py-8 sm:py-12 lg:py-16"
    >
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" class="mb-5 flex min-h-[40px] items-center sm:mb-6 sm:min-h-[44px]">
          <div class="terraco-skeleton h-4 w-40 rounded-sm"></div>
        </div>

        <article
          aria-hidden="true"
          class="terraco-floating-card overflow-hidden rounded-lg bg-elevated"
        >
          <div class="grid lg:grid-cols-12">
            <div
              class="terraco-skeleton aspect-[2/1] w-full rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle sm:aspect-[5/3] lg:col-span-7 lg:aspect-auto lg:min-h-[460px] lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)] lg:border-b-0 lg:border-r lg:border-border-subtle"
            ></div>

            <div
              class="flex flex-col justify-between gap-4 p-4 sm:gap-5 sm:p-6 lg:col-span-5 lg:gap-6 lg:p-6"
            >
              <div class="space-y-2">
                <div class="terraco-skeleton h-4 w-44 rounded-sm"></div>
                <div class="terraco-skeleton h-8 w-56 rounded-sm"></div>
              </div>

              <div
                class="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border-subtle py-3 sm:gap-x-6 sm:gap-y-4 sm:py-4"
              >
                <div class="space-y-1.5">
                  <div class="terraco-skeleton h-3 w-20 rounded-sm"></div>
                  <div class="terraco-skeleton h-4 w-24 rounded-sm"></div>
                </div>
                <div class="space-y-1.5">
                  <div class="terraco-skeleton h-3 w-16 rounded-sm"></div>
                  <div class="terraco-skeleton h-4 w-24 rounded-sm"></div>
                </div>
                <div class="space-y-1.5">
                  <div class="terraco-skeleton h-3 w-14 rounded-sm"></div>
                  <div class="terraco-skeleton h-4 w-20 rounded-sm"></div>
                </div>
                <div class="space-y-1.5">
                  <div class="terraco-skeleton h-3 w-14 rounded-sm"></div>
                  <div class="terraco-skeleton h-4 w-32 rounded-sm"></div>
                </div>
              </div>

              <div class="space-y-2.5">
                <div class="terraco-skeleton h-4 w-64 max-w-full rounded-sm"></div>
                <div class="terraco-skeleton h-[46px] w-full rounded-pill sm:h-[52px]"></div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
})
export class LaunchDetailSkeletonComponent {}
